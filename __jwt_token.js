/**
 * make api secure
 * 
 * concept
 * 1. assgn 2 token for each person (access token , refresh token)
 * 
 * Token contains : user identifications. email, role, etc.) valid for a shorter duration
 * 
 * 3. refresh token is used for recreate an access token that was expired.
 * 4. if refresh is invalid then logout the user
 * 
 * 
 * 
 * 
 * 
 * 1. jwt jsonwebtoken
 * 2. $ npm install jsonwebtoken
 * 3. generate a token by using 
 * jwt.sign(userOrEmail, secret, {expiresIn: "1h"})
 * then res.cookie('token', token, {
 *  httpOnly: true,
 * secure: true,
 * sameSite: "none"
 * })
 * form client side axios and withCredentials and fetch credentials : true,
 * cors setup = app.use(cors({
 *  origin: [linnk],
 * credentials: true,
 * }))
 * 
 * 
 * 
 * for secure api calls
 * install cookie parser and use it as middleware
 * req.cookies
 * on the client side : make api call use axios api calls withCredentials :true, or credentials: "include" while useing fetch
 * 
**/