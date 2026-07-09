"""Seed fixed demo accounts for local/dev trials of role-gated features.

Do NOT run this against a production database — it creates accounts with
publicly-documented credentials (see backend/README.md). The script refuses
to run unless APP_ENV=development.

Usage:
    cd backend && python -m scripts.seed_demo
"""

import asyncio
from datetime import date

from app.core.config import get_settings
from app.core.security import create_password_hash
from app.db.session import AsyncSessionLocal
from app.models.enums import Department, Region, Role
from app.models.user import User
from sqlalchemy import select

DEMO_PASSWORD = "DemoPass1!"

DEMO_USERS = [
    {"first_name": "Demo", "last_name": "Employee", "email": "demo.employee@rms.local", "role": Role.Employee},
    {"first_name": "Demo", "last_name": "Manager", "email": "demo.manager@rms.local", "role": Role.Management},
    {"first_name": "Demo", "last_name": "Executive", "email": "demo.executive@rms.local", "role": Role.Executive},
    {"first_name": "Demo", "last_name": "Admin", "email": "demo.admin@rms.local", "role": Role.Admin},
    {"first_name": "Demo", "last_name": "Developer", "email": "demo.developer@rms.local", "role": Role.Developer},
]


async def seed() -> None:
    settings = get_settings()
    if not settings.is_development:
        raise SystemExit(
            "Refusing to seed demo accounts: APP_ENV is not 'development'. "
            "This script must never run against a production database."
        )

    async with AsyncSessionLocal() as db:
        for spec in DEMO_USERS:
            existing = (
                await db.execute(select(User).where(User.email == spec["email"]))
            ).scalar_one_or_none()
            if existing is not None:
                print(f"skip (already exists): {spec['email']}")
                continue

            password_hash, password_salt = create_password_hash(DEMO_PASSWORD)
            db.add(
                User(
                    first_name=spec["first_name"],
                    last_name=spec["last_name"],
                    email=spec["email"],
                    password_hash=password_hash,
                    password_salt=password_salt,
                    is_external=False,
                    department=int(Department.D1),
                    region=int(Region.India),
                    role=int(spec["role"]),
                    work_hours_per_day=8,
                    parent_id=0,
                    date_created=date.today(),
                )
            )
            print(f"created: {spec['email']} ({spec['role'].name})")
        await db.commit()

    print(f"\nDemo password for all seeded accounts: {DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
