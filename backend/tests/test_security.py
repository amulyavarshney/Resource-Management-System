from app.core.security import create_password_hash, decode_access_token, create_access_token, verify_password


def test_password_hash_verify():
    pw = "SecureP@ss1"
    h, s = create_password_hash(pw)
    assert h is not None and s is not None
    assert verify_password(pw, h, s)
    assert not verify_password("WrongPass1!", h, s)


def test_none_password():
    h, s = create_password_hash(None)
    assert h is None and s is None
    # An account with no password set has no password-based login at all —
    # verification always fails, regardless of what's supplied. This is what
    # closes the passwordless-login exploit (verify_password(None, None, None)
    # used to return True).
    assert not verify_password(None, None, None)
    assert not verify_password("anything", None, None)


def test_jwt_roundtrip():
    token = create_access_token(42, "test@example.com", "Admin")
    payload = decode_access_token(token)
    assert payload["id"] == 42
    assert payload["email"] == "test@example.com"
    assert payload["Role"] == "Admin"
