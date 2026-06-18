from fastapi import APIRouter

from app.api.v1.routers import auth, dashboard, holidays, leaves, lock, projects, users, week_data

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(projects.router)
router.include_router(week_data.router)
router.include_router(dashboard.router)
router.include_router(holidays.router)
router.include_router(leaves.router)
router.include_router(lock.router)
