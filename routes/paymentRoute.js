const express = require('express')
const Router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)


Router.post('/create-checkout-session', async (req, res) => {
    const {ticketPayment, userId} = req.body
    const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'THÔNG TIN VÉ ĐÃ ĐẶT',
            description: 
            'Tên phim: ' + ticketPayment.nameMovie + 
            ' - Rạp: '+ ticketPayment.nameCinema + 
            ' - Ngày chiếu: ' + ticketPayment.startDate + 
            ' - Giời chiếu: ' + ticketPayment.startTime
            ,
          },

          unit_amount: ticketPayment.total*100000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',

    success_url: `${process.env.CLIENT_PORT}/checkout-success`,
    cancel_url: `${process.env.CLIENT_PORT}/booking`,
  });
  res.json({url: session.url});
});


Router.post('/payment-momo',(req, Rres) => {
  const partnerCode = "MOMO";
  const accessKey = "F8BBA842ECF85";
  const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const requestId = partnerCode + new Date().getTime();
  const orderId = requestId;
  const orderInfo = "pay with MoMo";
  const redirectUrl = "http://localhost:3000/booking";
  const ipnUrl = "http://localhost:3000/booking";

  const amount = req.body.amount;
  const requestType = "captureWallet"
  const extraData = ""; //pass empty value if your merchant does not have stores

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------")
  console.log(rawSignature)
  //signature
  const crypto = require('crypto');
  const signature = crypto.createHmac('sha256', secretkey)
      .update(rawSignature)
      .digest('hex');
  console.log("--------------------SIGNATURE----------------")
  console.log(signature)

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'en'
  });
  //Create the HTTPS objects
  const https = require('https');
  const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
      }
  }
  //Send the request and get the response
  const hm = https.request(options, res => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (body) => {
          console.log('Body: ');
          console.log(body);
          console.log('payUrl: ');
          console.log(JSON.parse(body).payUrl);
          return Rres.json(JSON.parse(body).payUrl)
      });
      res.on('end', () => {
          console.log('No more data in response.');
      });
  })

  hm.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....")
  hm.write(requestBody);
  hm.end();
});

module.exports = Router