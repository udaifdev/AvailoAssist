import React, { useEffect, useState } from 'react';

interface MapComponentProps {
  userCoordinates: { lat: number; lng: number };
  workerCoordinates: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({ userCoordinates, workerCoordinates }) => {
    console.log('worker coordinaates.........', workerCoordinates)
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Google Maps script
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,directions`;
      script.async = true;
      script.onload = () => setMapLoaded(true);  // Set state to indicate script has loaded
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        setMapLoaded(false);
      };
      document.head.appendChild(script);
    };

    // Load the script only once
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when script has loaded
  useEffect(() => {
    if (mapLoaded && window.google) {
      const map = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: workerCoordinates,
        zoom: 12,
      });

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      const request = {
        origin: workerCoordinates,
        destination: userCoordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    }
  }, [mapLoaded, userCoordinates, workerCoordinates]);

  return (
    <div>
      {mapLoaded ? (
        <div id="map" style={{ height: '400px', width: '100%' }}></div>
      ) : (
        <p>Loading Map...</p>
      )}
    </div>
  );
};

export default MapComponent;
