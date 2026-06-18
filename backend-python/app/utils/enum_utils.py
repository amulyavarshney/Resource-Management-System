from enum import IntEnum
from typing import TypeVar

T = TypeVar("T", bound=IntEnum)

# Description map (mirrors C# [Description] attributes)
_DESCRIPTIONS: dict[type, dict[str, int]] = {
}

# Leave type descriptions from C# [Description] attributes
from app.models.enums import LeaveSession, LeaveType

_DESCRIPTIONS[LeaveType] = {
    "Casual Leave": LeaveType.Casual,
    "Planned Leave": LeaveType.Planned,
    "Sick Leave": LeaveType.Sick,
    "Unplanned Leave": LeaveType.Unplanned,
    # also accept plain enum names
    "Casual": LeaveType.Casual,
    "Planned": LeaveType.Planned,
    "Sick": LeaveType.Sick,
    "Unplanned": LeaveType.Unplanned,
}

_DESCRIPTIONS[LeaveSession] = {
    "Full Day": LeaveSession.FullDay,
    "Half Day": LeaveSession.HalfDay,
    "FullDay": LeaveSession.FullDay,
    "HalfDay": LeaveSession.HalfDay,
}


def parse_by_name_or_description(enum_cls: type[T], value: str) -> T:
    """Parse an enum by its name or description string. Raises ValueError if not found."""
    desc_map = _DESCRIPTIONS.get(enum_cls, {})
    if value in desc_map:
        return enum_cls(desc_map[value])  # type: ignore[return-value]
    # Try direct name match
    try:
        return enum_cls[value]  # type: ignore[return-value]
    except KeyError:
        raise ValueError(f"Invalid {enum_cls.__name__}: {value!r}")
