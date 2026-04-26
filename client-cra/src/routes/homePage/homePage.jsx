import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";
import Map from "../../components/map/Map";
function HomePage() {
  useContext(AuthContext);
  const items = [
    // {
    //   id: 1,
    //   latitude: 13.0827,
    //   longitude: 80.2707,
    //   title: "Chennai House",
    //   bedroom: 2,
    //   price: 5000,
    //   images: ["https://via.placeholder.com/150"],
    // },
  ];
  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Real Estate & Get Your Dream Place</h1>
          <p>
            Search for homes below!!
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>16+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className="box">
              <h1>200</h1>
              <h2>Award Gained</h2>
            </div>
            <div className="box">
              <h1>2000+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <Map items={items} />
      </div>
    </div>
  );
}

export default HomePage;
