# Guestbook

A single public page where anyone can leave a short note and later edit or remove their own note by proving they know its password. There are no accounts.

## Language

**Entry**:
One note left in the guestbook, made of an Author name, a Message, and the time it was written.
_Avoid_: Post, comment, article, 글 (in code identifiers)

**Author name**:
The free-text name a visitor types when writing an Entry; it identifies nobody and is not unique.
_Avoid_: User, username, account, nickname

**Message**:
The body text of an Entry, and the only part of an Entry that can be changed after writing.
_Avoid_: Content, body, text

**Entry password**:
The secret chosen when an Entry is written; knowing it is the only proof of ownership of that Entry.
_Avoid_: User password, login, credential

**Written at**:
The moment an Entry was first created; editing the Message does not change it.
_Avoid_: Updated at, posted date

**Developer credit**:
The fixed line "개발자: <name> (202404193)" shown on the page to identify who built the app.
_Avoid_: Footer, signature
