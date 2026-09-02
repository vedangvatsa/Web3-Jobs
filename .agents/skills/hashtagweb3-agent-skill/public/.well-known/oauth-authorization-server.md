# Hashtag Web3 OAuth Authorization Server Metadata (RFC 8414)

Authorization server metadata for agent authentication against the Hashtag Web3 platform API.

- Registration: POST https://hashtagweb3.com/api/auth/register
- Token claim: POST https://hashtagweb3.com/api/auth/claim
- Revocation: POST https://hashtagweb3.com/api/auth/revoke
- Full walkthrough: https://hashtagweb3.com/auth.md

## Raw Metadata

The canonical JSON document is served at `/.well-known/oauth-authorization-server` with Content-Type `application/json`.
