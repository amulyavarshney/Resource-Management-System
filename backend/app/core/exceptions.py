class RecordNotFoundException(Exception):
    def __init__(self, message: str = "Record not found") -> None:
        super().__init__(message)


class DuplicateEntityException(Exception):
    def __init__(self, message: str = "Entity already exists") -> None:
        super().__init__(message)


class LoginFailedException(Exception):
    def __init__(self, message: str = "Invalid email or password") -> None:
        super().__init__(message)


class PasswordMismatchException(Exception):
    def __init__(self, message: str = "Password mismatch") -> None:
        super().__init__(message)


class OperationNotSupportedException(Exception):
    def __init__(self, message: str = "Operation not supported") -> None:
        super().__init__(message)


class DomainInvariantException(Exception):
    def __init__(self, message: str = "Domain invariant violated") -> None:
        super().__init__(message)
