

const nodemailer = require("nodemailer");
const googleApis = require("googleapis");

const CLIENT_ID = `855796553539-ljv82liaosbk709jung33qgijup6uill.apps.googleusercontent.com`
const CLIENT_SECRET = `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`
const REFRESH_TOKEN = `1//043UXfk_82lSaCgYIARAAGAQSNgF-L9IrLB3rM0gbueMa9d-Zb4GAlOW63Uc4FDDDk2BK0mDmryaKaeu-3tLA6Ye6Y7arse7U6g`
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;


const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,
    REDIRECT_URI);

    authClient.setCredentials({refresh_token: REFRESH_TOKEN});

    async function mailer(receiver, id, key){
        try{
            const ACCESS_TOKEN = await authClient.getAccessToken();

            const transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user:"rajpardhi962000@gmail.com",
                    clientId:CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken:REFRESH_TOKEN,
                    accessToken:ACCESS_TOKEN
                }
            })
            const details ={
                from:"Raj Pardhi<rajpardhi962000@gmail.com>",
                to:receiver,
                subject:"For change your password",
                text:"Kya ho rha hai",
                html: `hey you can recover your account by clicking following link 
               <a href="http://localhost:3000/forgot/${id}/${key}">this link will reset password</a>`
            }

            const result = await transport.sendMail(details)
            return result;

        }
        catch(err){
            return err;
        }

    }
    


    module.exports = mailer;