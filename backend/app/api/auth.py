import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext

from ..database import get_db
from ..models.models import User, Notification
from ..schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UpdateProfile, ChangePassword
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user_optional(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    if not token:
        # Return default demo user if exists for smooth local demonstration
        demo_user = db.query(User).filter(User.email == "demo@sentinel.ai").first()
        return demo_user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.email == email).first()

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    user = get_current_user_optional(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=hashed_pw,
        role="analyst",
        dark_mode=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create welcome notification
    welcome_note = Notification(
        user_id=new_user.id,
        title="Welcome to SentinelAI",
        message="Your enterprise sentiment intelligence workspace is ready.",
        type="info"
    )
    db.add(welcome_note)
    db.commit()
    
    token = create_access_token({"sub": new_user.email, "id": new_user.id})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
        
    token = create_access_token({"sub": user.email, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_in: UpdateProfile, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if profile_in.name:
        current_user.name = profile_in.name
    if profile_in.email:
        # Check email uniqueness
        existing = db.query(User).filter(User.email == profile_in.email.lower(), User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use by another user.")
        current_user.email = profile_in.email.lower()
    if profile_in.dark_mode is not None:
        current_user.dark_mode = profile_in.dark_mode
    if profile_in.ai_provider:
        current_user.ai_provider = profile_in.ai_provider
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(passwords: ChangePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(passwords.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password.")
    current_user.password_hash = get_password_hash(passwords.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
