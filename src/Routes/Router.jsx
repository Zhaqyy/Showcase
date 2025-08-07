import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Loader from "../Component/Loader/Loader";
import Transitioner from "../Util/Transition";

import Home from "../Pages/Home";
import Screenshot from "../Pages/Screenshot";
import DrawerExample from "../Component/DrawerExample";

// import Header from "../Component/Header";

const Router = () => {
  const [loaderFinished, setLoaderFinished] = useState(false);

  return (
    <>
      {/* <Loader onComplete={() => setLoaderFinished(true)} /> */}

      {/* Render routes only after the loader signals completion */}
      {/* {loaderFinished && ( */}
        <>
          {/* <Header /> */}

          <Routes>
            <Route
              index
              path='/'
              element={
                <Transitioner>
                  <Home />
                </Transitioner>
              }
            />
            <Route
              path='/screenshot'
              element={
                // <Transitioner>
                  <Screenshot />
                // </Transitioner>
              }
            />
            <Route
              path='/draw'
              element={
                // <Transitioner>
                  <DrawerExample />
                // </Transitioner>
              }
            />
            {/* <Route
              path='/Project/:id'
              element={
                <Transitioner>
                  <Work />
                </Transitioner>
              }
            /> */}
          </Routes>
        </>
      {/* )} */}

    </>
  );
};

export default Router;
