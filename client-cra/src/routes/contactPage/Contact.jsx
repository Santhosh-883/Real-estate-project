import "./contact.scss";

function Contact() {
  return (
    <div className="contact">
      <div className="wrapper">
        <h1>Contact Us</h1>
        <form>
          <input type="text" placeholder="Full Name" name="name" required />
          <input type="email" placeholder="Email Address" name="email" required />
          <input type="text" placeholder="Phone Number" name="phone" required />
          <textarea placeholder="Your Message" name="message" rows="5"></textarea>
          <button type="submit">Send Message</button>
        </form>
        <div className="details">
          <p>
            <b>Email:</b> supportteam@realestate.com
          </p>
          <p>
            <b>Phone:</b> 9876543210
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
