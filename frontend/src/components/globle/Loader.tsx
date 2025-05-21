import React from "react";
import { Audio, ThreeCircles, Hourglass, Circles } from 'react-loader-spinner';

const Loader: React.FC = () => {
  return (
    <div className="flex bg-white items-center justify-center h-screen bg-gray-800">
      <Hourglass
        visible={true}
        height="90"
        width="100"
        ariaLabel="hourglass-loading"
        wrapperStyle={{}}
        wrapperClass=""
        colors={['#4fa94d', '#72a1ed']}
      />
      <div className="flex font-bold text-2xl items-center justify-center">Loding Please Wait....</div>
      <Circles
        height="20"
        width="20"
        color="#4fa94d"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
      {/* <ThreeCircles
        visible={true}
        height="50"
        width="50"
        color="#4fa94d"
        ariaLabel="three-circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
      /> */}
    </div>
  );
};

export default Loader;
