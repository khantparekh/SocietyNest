const PayU  = require('payu-websdk');
const crypto = require('crypto');

const key  = process.env.PAYU_MERCHANT_KEY;
const salt = process.env.PAYU_MERCHANT_SALT;

// 'TEST' or 'LIVE'
const payuClient = new PayU({ key, salt }, process.env.PAYU_ENVIRONMENT || 'TEST');

const sha512 = str => crypto.createHash('sha512').update(str).digest('hex');

const createTransaction = async ({
  txnid, amount, productinfo, firstname, email, phone,
  surl, furl,
  udf1='', udf2='', udf3='', udf4='', udf5='',
}) => {
  // Build hash manually — same formula payu-websdk uses internally
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  const hash = sha512(hashString);

  console.log('\n── PayU createTransaction ──');
  console.log({ txnid, amount, productinfo, firstname, email, surl, furl, hash });

  const data = await payuClient.paymentInitiate({
    isAmountFilledByCustomer: false,
    amount,
    currency: 'INR',
    firstname,
    email,
    phone,
    txnid,
    productinfo,
    surl,
    furl,
    hash,
  });

  return { data, hash };
};

const verifyPayment = async (txnid) => {
  return await payuClient.verifyPayment(txnid);
};

module.exports = { payuClient, createTransaction, verifyPayment, sha512, key, salt };