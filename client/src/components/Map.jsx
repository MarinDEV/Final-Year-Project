/*
    The map component used on check out and address modal.
*/
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useRef, useCallback, useState, useEffect } from 'react';
import styles from "../style/map.module.css";

const Map = (props) => {

    
    const [location, setLocation] = useState();
    const [center, setCenter] = useState({lat: 41.323537265467095, lng: 19.817270029913658});
    const [zoom, setZoom] = useState(12);//default

    // Sets center if passed by parent.
    useEffect(() => {
        if(props.center){
            setCenter(props.center);
            setLocation(props.center);
        }
    }, [props.center]);
    
    // Google API implementation
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyABcH1Lf3VPvHDy8v2y20EytYmBjxHPecU",
    });
    if (!isLoaded) return <div>Loading...</div>

    // Set the location of the marker when clicked, unless allowClicks == false.
    const handleClick =(e) => {
        if(props.allowClicks == false) return;
        setLocation({lat: e.latLng.lat(), lng: e.latLng.lng()});
        props.setPosition({lat: e.latLng.lat(), lng: e.latLng.lng()})
    }

    return (
        <div className={styles.map} coordinates={location}>
            <div className={styles.map}>
            <GoogleMap 
                zoom={zoom} 
                center={center} 
                mapContainerClassName={styles.mapContainer}
                options={{
                    mapId: 'd5d5ef264e74fd02',
                    mapTypeId: 'hybrid',
                    disableDefaultUI: true,
                    clickableIcons: false,
                }}
                onClick={(e) => handleClick(e)}
            >
                <Marker position={location}/>
            </GoogleMap>
            </div>
        </div>
    );
}

export default Map;