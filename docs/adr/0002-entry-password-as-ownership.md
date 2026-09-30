# Ownership is proven per Entry by its password, not by accounts

There is no sign-up or login; each Entry carries its own password, and whoever knows it may change the Message or delete the Entry. The password is stored only as a scrypt hash with a random per-entry salt (`node:crypto`), compared with `timingSafeEqual`, and never returned by any API. A wrong password is refused with 403 "비밀번호가 일치하지 않습니다". A forgotten password cannot be recovered and there is no admin override; both are out of scope.
