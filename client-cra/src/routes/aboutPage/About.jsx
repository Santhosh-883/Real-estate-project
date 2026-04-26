import "./about.scss";

function About() {
  return (
    <div className="about">
      <div className="wrapper">
        <h1>Welcome to RealEstate</h1>
        <p>
          At RealEstate, we believe that finding a home is more than just a
          transaction; it's about finding your place in the world. With over two
          decades of experience in the industry, we have helped thousands of
          families and individuals find their dream properties.
        </p>
        <p>
          Our mission is to provide an integrated platform that simplifies the
          property search process, offering transparency, reliability, and
          unparalleled customer service. Whether you're buying your first home,
          looking for a rental, or investing in commercial property, our team
          of experts is here to guide you every step of the way.
        </p>
        <div className="stats">
          <div className="stat">
            <h2>16+</h2>
            <span>Years of Experience</span>
          </div>
          <div className="stat">
            <h2>200</h2>
            <span>Award Gained</span>
          </div>
          <div className="stat">
            <h2>2000+</h2>
            <span>Property Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
