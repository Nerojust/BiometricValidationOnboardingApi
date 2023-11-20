// export function removeSensitiveDataFromObject(user) {
//   const userObject = user.toObject();
//   delete userObject.password;
//   delete userObject.fingerPrintKey;
//   delete userObject.__v;
//   return userObject;
// }
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

const ppk = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApO83c0Rzg1jhm92w5b+Vx4shaWz8MRNgL61stWK0RrESdvra4hbscBxk+P5LlR6673+1y0yMTV2A6+M+HTM35wBGKr+cLe8L/s5j2++RAW6bAqF2FHXtbg2jqMMNY1/lbjUIBK6Ea0v9gHID6R6dkhU18wegzE4tBbbbczmcRcQ2rykOfq9ZkgeEFahw3QlvPop4uOtqNYeK4hE6klK66geFda+qmckbjYRQv8Xg/f0GkTzTOkZUSGOtwW8/UxHNW9z4MKrggSzYn2+wej+ebNNg13ndQDc4hzOoW67UJA8QTGDlOWT7xCZMFKav1gl1w3s7umtG303/8g1rto3MCwIDAQAB`;

const pvk = `MIIEogIBAAKCAQEApO83c0Rzg1jhm92w5b+Vx4shaWz8MRNgL61stWK0RrESdvra4hbscBxk+P5LlR6673+1y0yMTV2A6+M+HTM35wBGKr+cLe8L/s5j2++RAW6bAqF2FHXtbg2jqMMNY1/lbjUIBK6Ea0v9gHID6R6dkhU18wegzE4tBbbbczmcRcQ2rykOfq9ZkgeEFahw3QlvPop4uOtqNYeK4hE6klK66geFda+qmckbjYRQv8Xg/f0GkTzTOkZUSGOtwW8/UxHNW9z4MKrggSzYn2+wej+ebNNg13ndQDc4hzOoW67UJA8QTGDlOWT7xCZMFKav1gl1w3s7umtG303/8g1rto3MCwIDAQABAoH/IYB1wvQkgomLSh290O0Zf27DWqbIky9cWlLfwfhKphFRrtlFnKcLX7pkyC7fK2sSjZNjWegyl4Rmq4N9GnFM6Z8koYpKLwpfZWKG5iXDToco9V/WnFFX6QLcO2tjTMwtzjT3a/wG6cSFuZFvOer+Fq44RyVFhDpc6sw5xy3skD73HwHqD6NFZ5oLOhseXuxkiKhm+Ow6OxZFoTz4X+IqRkUyMqACT7M+xzVltpw0s342lJ07LVsTZ8sZBkoA5G4ZM4pFqxR0Z0DIxJ/ByS4ZhEcdx4KbB/3KIf8FuhNIGuxV1o/RUVfN5Dtr18Fas+kWj/iO15YnMbNTQQKO8eqhAoGBAN52Pzc6OIMKhgWb9PvGI++bO7iYofO8fIUKl9gqOGtCwh2Ebgq8FMP/NmNmILVVKEP8drYf0g6rnEYHZoc0Dc9WX+d1TeVRDoW/9pNVxkrmA49jz+EzTwhEx1KWVKhDYj5WgNdpVOCvHnni83xg37i/gHX19bSKz6Blou5fKp7XAoGBAL3MvVvaXJZR+lzbbNU0Olrs565BJgR8awJQCh9j5mxqDO97+67y1BBHJa28EeBH2hrVn6f6BrgEzsYpXEX/V7rpurwDeeoKLCtiYtYzjZUE9BYX9tvYvMNXK5I2GiEklvWY1+cFbQsoizRJcjsMeYl062kmNZhVNuSyJn2QIFntAoGBANu3Pkh1oEsMocH4fsYMtIF6eEmhtpLcnr9n7wD48jA+ByrQGT9Q89GAx171B2kRamt7dmP6maUTqY0g0grHRrx5Os+H9B+BJy7Coe5y0R44f1un4TEzU+N+yr6u634kz2tyVF5tEf+39gm8NW+q3kvCGEZpXvup/dcViw6Tv6yRAoGAXWAGoNPSzRlTpK9G4bUqKGV4rZ/bhkV3l9GsyTiquheKeZ9zeOR6M+/st4ZY/RAcWytRuqAlAg9Lcu4SOVWf4ZLvjWPgbKXIiSeEHIGMXA3tz5jGl+4PH8MY6nu3ayrHIdiqDzv6I400vuqLSkWe3WMqFbb4kxMJSIXkrc1kPRkCgYEAhLyjn7tJdbLtSKGsLVxxg/pVH+jss9H7h4tfqDL0yF5mdqme7MKJSOqycjtvhjDYGPxVxvBi8DLGIJUOm0S4DoYhhzUtgwRBDh6O0Zw7wmwhYF4tNIkyPb71L3Na1mw1SGTq6T691EaK1iEHkFXWwb0Ofmo65GMgZMqtpfZm7Gs=`;


// Encrypt the request data
function encryptRequest(requestData) {
    const serverKey = new NodeRSA(ppk, 'pkcs8-public-pem', { encryptionScheme: 'pkcs1' });

    // Generate a random symmetric key
    const secretKey = crypto.randomBytes(16).toString('hex'); // 128-bit key
  
    // Encrypt the request using the symmetric key
    const iv = crypto.randomBytes(16); // 128-bit IV
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encryptedRequestData = cipher.update(JSON.stringify(requestData), 'utf8', 'base64');
    encryptedRequestData += cipher.final('base64');
  
    // Encrypt the symmetric key using the server's public key
    const encryptedSecretKey = serverKey.encrypt(secretKey, 'base64');
  
    // Prepare the encryptedRequest object
    return {
      data: encryptedRequestData,
      iv: iv.toString('base64'),
      encryptedSecretKey,
    };
}

// Decrypt the response data
function decryptResponse(encryptedResponse) {
  const clientPrivateKeyInstance = new NodeRSA(pvk, 'pkcs1-private-pem', { encryptionScheme: 'pkcs1' });
  const decryptedSecretKey = clientPrivateKeyInstance.decrypt(encryptedResponse.encryptedSecretKey);

  // Decrypt the response using the decrypted symmetric key
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptedSecretKey, 'hex'), Buffer.from(encryptedResponse.iv, 'base64'));
  let decryptedResponse = decipher.update(encryptedResponse.data, 'base64', 'utf8');
  decryptedResponse += decipher.final('utf8');

  return JSON.parse(decryptedResponse);
}

// // Example usage
// const requestData = { username: 'nerojust', password: 'Baddo' };

// // Encrypt the request
// const encryptedRequest = encryptRequest(requestData);
// console.log("Encrypted Request:", encryptedRequest);

// // Simulate sending the encrypted response to the client
// // and receiving the encrypted request
// const encryptedResponse = {
//   data: encryptedRequest.data, // Actual encrypted response data
//   iv: encryptedRequest.iv, // Actual IV
//   encryptedSecretKey: encryptedRequest.encryptedSecretKey, // Actual encrypted secret key
// };

// // Decrypt the response
// const decryptedResponse = decryptResponse(encryptedResponse);
// console.log("Decrypted Response:", decryptedResponse);


module.exports = { encryptRequest,decryptResponse };
