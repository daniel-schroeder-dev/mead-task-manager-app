const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (action, email, user) => {
  let subject = '';
  let text = '';
  if (action === 'signup') {
    subject = 'Welcome to the Task App';
    text = `Thanks for singing up ${user}!`;
  } else if (action === 'cancel') {
    subject = 'Sorry to see you leave Task App';
    text = `Thanks ${user} for using Task App, we will miss you!`;
  }
  const msg = {
    to: email,
    from: 'test@example.com',
    subject,
    text,
  };
  sgMail.send(msg);
};