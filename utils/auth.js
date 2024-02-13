/**
 * Auth - contain neccessary method needed to extract and retrieve the value of authorization token.
 */

class Auth {
  constructor() {}

  /*
   * extract a base64 token from a string
   * @param {String} - string containing base64 token
   * @return {String | null} - token on success or null if otherwise
   */
  extractTokenFromAuth(request) {
    const authorization = request.headers?.authorization ?? null;
    if (authorization) {
      if (authorization.startsWith('Basic ')) {
        const base64Token = authorization.substring(6);
        if (base64Token) { return base64Token.trim();}
      }
    }
    return null;
  }
  
  /*
   * decode and return the decoded a given base64 token
   * @param {String} - representing base64 token
   * @return {String | null}
   */
  decodeBase64Token(b64token) {
    const decodedToken = Buffer.from(b64token, 'base64').toString('utf-8') ?? null;
    return decodedToken;
  }
  
  /**
   * extract email and password from a string based on ':' delimiter 
   * @param: {String} containing email and password delimiter by ':'
   * @return {Object}
   */
  getUserAndPassword(info) {
    const delimiter = info.lastIndexOf(':');
    const email = info.substring(0, delimiter);
    const pword = info.substring(delimiter + 1);
    return {email: email ?? null, password: pword ?? null};
  }
}

const auth = new Auth();

function getInfo(request) {
  let info;
  if (request) {
    info = auth.extractTokenFromAuth(request);
    if (info) {
      info = auth.decodeBase64Token(info);
      if (info) { return auth.getUserAndPassword(info)}
    }
  }
  return null;
}

export default getInfo;

/**
 **** test run ***
const token = Buffer.from('bell:oabdul:samad:@gmail.com:password123').toString('base64');
const req = {headers: {authorization: `Basic ${token}`}};
const auth = new Auth();
const basic = auth.extractTokenFromAuth(req);
console.log(basic);
const info = auth.decodeBase64Token(basic);
console.log(info);
console.log(auth.getUserAndPassword(info));
**/
