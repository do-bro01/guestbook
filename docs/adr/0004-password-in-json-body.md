# The Entry password travels in the JSON body, including on DELETE

`PATCH` and `DELETE /api/entries/[id]` both take `{ "password": "..." }` as a JSON request body. Query strings and URLs end up in access logs and browser history, and a custom header would be unusual for a form value, so the body is the least leaky option, even though a body on DELETE is uncommon. Clients must send `Content-Type: application/json` on DELETE as well.
