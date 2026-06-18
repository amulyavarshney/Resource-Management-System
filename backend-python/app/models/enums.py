import enum


class Department(enum.IntFlag):
    D1 = 1
    D2 = 2


class Region(enum.IntFlag):
    India = 1
    USA = 2


class Role(enum.IntEnum):
    Employee = 0
    Management = 1
    Executive = 2
    Admin = 3
    Developer = 4


class HolidayType(enum.IntEnum):
    Compulsory = 0
    Festival = 1


class LeaveType(enum.IntEnum):
    Casual = 0
    Planned = 1
    Sick = 2
    Unplanned = 3


class LeaveSession(enum.IntEnum):
    FullDay = 0
    HalfDay = 1
