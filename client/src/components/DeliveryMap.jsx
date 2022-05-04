/*
    The map component used on check out and address modal.
*/

/*global google*/
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer, DirectionsService } from "@react-google-maps/api";
import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../style/deliverymap.module.css";
import {Button} from 'react-bootstrap';
import api from '../api';

const DeliveryMap = (props) => {

    const navigate = useNavigate();
    const [zoom, setZoom] = useState(15);//default

    const [orderChange, setOrderChange] = useState(false);
    const [orders, setOrders] = useState([]);
    const [startLocation, setStartLocation] = useState();
    const [changedOrder, setChangedOrder] = useState(false);
    const [nextIndex, setNextIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [directions, setDirections] = useState();
    const [finished, setFinished] = useState(false);
    const [initialLoc, setInitialLoc] = useState(true);

    const [counters, setCounters] = useState({
        deliveredCount: 0
    });

    // Sets center if passed by parent.
    useEffect(() => {
        if(!props.center){return}
        setStartLocation(props.center);
    }, [props.center]);

    // Gets the orders from database and orders them by quickest route.
    useEffect(() => {
        if(orders.length >0) return;
        const or = []; // {orderId: orderId, coordinates: {lat: x, lng: y}}
        props.orders.forEach((order, index) => {
            const _id = order._id;
            const coordinates = order.address.coordinates;
            or.push({orderId: _id, coordinates, show: true, order: `${index}`});
        });
        setOrders(or);
        let url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=41.323537265467095%2C19.817270029913658';
        or.forEach((order) => {
            url += `%7C${order.coordinates.lat}%2C${order.coordinates.lng}`;
        })
        url += '&destinations='
        or.forEach((order, index) => {
            if(index == 0){
               url = url + `${order.coordinates.lat}%2C${order.coordinates.lng}`; 
            }else{
                url = url + `%7C${order.coordinates.lat}%2C${order.coordinates.lng}`;
            }
        });

        url += '&key=AIzaSyABcH1Lf3VPvHDy8v2y20EytYmBjxHPecU';
        api.getDistanceMatrix({url}).then((res) => {
            const newRows = [];
            res.data.rows.forEach((row) => {
                const newElements = [];
                row.elements.forEach((element, index) => {
                    if(element.distance.value == 0) return;
                    newElements.push({index, distance: element.distance.value});
                })
                newRows.push(newElements);
            });
            getShortestMatrix(or, newRows);
        });
    }, [props.orders])

    // Gets all the possible route permutations and chooses the one with the shortest distance.
    const getShortestMatrix = (orders, rows) => {
        const numbersArray = []
        rows.forEach((row,index) => {
            if(index == 0) return;
            numbersArray.push(index-1);
        })
        const possibleRoutes = permute(numbersArray);
        // console.log(possibleRoutes);
        let shortestRoute;
        let shortestDistance;
        possibleRoutes.forEach((route, i) => {
            let routeDistance = rows[0].find((initialStop) => initialStop.index == route[0]).distance;
            // console.log(route.toString());
            route.forEach((stop,index) => {
                if(index==route.length-1) {
                    return;
                }
                const nextStop = route[route.indexOf(stop) + 1];
                const nextStopDistance = rows[stop+1].find((st) => st.index == nextStop).distance;
                routeDistance+=nextStopDistance;
            });
            if(!shortestRoute){
                shortestRoute = route;
                shortestDistance = routeDistance;
            }else{
                if(routeDistance < shortestDistance){
                    shortestRoute = route;
                    shortestDistance = routeDistance;
                }
            }
            // console.log(`Route Distance: ${routeDistance} meters`);
        });
        // console.log(`Shortest route: ${shortestRoute}`);    
        updateOrder(orders, shortestRoute);
    }

    // Re-orders all orders to fit the shortest route.
    const updateOrder = (orders, shortestRoute) => {
        const updatedOrders = [];
        let index = 0;
        while(index<orders.length){
            const order = orders.find((order) => parseInt(order.order) == shortestRoute[index]);
            const newOrder = {...order, order: index};
            updatedOrders.push(newOrder);
            index+=1;
        }
        setOrders(updatedOrders);  
        props.reorder(updatedOrders); 
    }

    // TODO: Reference stackoverflow (NOT MY ALGORITHM)
    function permute(permutation) {
        var length = permutation.length,
            result = [permutation.slice()],
            c = new Array(length).fill(0),
            i = 1, k, p;

        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i];
                permutation[i] = permutation[k];
                permutation[k] = p;
                ++c[i];
                i = 1;
                result.push(permutation.slice());
            } else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    }


    // Performs database actions to update the state of the delivery
    const databaseNext = async (final) => {
        const order = orders.find((order) => parseInt(order.order) == currentIndex-1);
        await api.nextLocation({orderId: order.orderId}).then((res) => {
            props.removeOrder(order.orderId);
            if(final){
                api.completeDelivery();
            }
        });
    }

    // Removes the markers of orders that match the location0 and location1
    const deleteMarkers = (location0, location1) => {
        const updatedOrders = []
        orders.forEach((order, index) => {
            if(order.coordinates == location0 || order.coordinates == location1){
                order.show = false;
            }
            updatedOrders.push(order);
        });
        setOrders(updatedOrders);
    }

    // Returns the next route locations (start,finish)
    const getNextLocation = () => {
        if(initialLoc){
            setInitialLoc(false);
            const nextMarker = orders.find((order) => parseInt(order.order) == 0);
            setCurrentIndex(1);
            return [startLocation, nextMarker.coordinates];
        }else{
            const currentMarker = orders.find((order) => parseInt(order.order) == currentIndex-1);
            const nextMarker = orders.find((order) => parseInt(order.order) == currentIndex);
            setCurrentIndex(currentIndex+1);
            return [currentMarker.coordinates,nextMarker.coordinates];
        }
    }


    // Actions when the next location button is clicked
    const nextLocation = () => {
        if(!initialLoc){
            databaseNext();
        }
        const locations = getNextLocation();
        deleteMarkers(locations[0], locations[1]);
        showDirections(locations[0], locations[1])
        if(currentIndex >= orders.length - 1){
            setFinished(true);
        }  
    }
    
    // Actions when the start button is clicked
    const startDelivery = () => {
        if(orderChange) return;
        setStarted(true);
        nextLocation();
    }

    // Finishes the delivery and redirects.
    const finishDelivery = async () => {
        await databaseNext(true);
        navigate(`${process.env.PUBLIC_URL}/admin/orders`)
    }

    // Resets all the orders and sets orderChange = true
    const startOrderChange = () => {
        setOrderChange(true);
        const updatedOrders = [...orders];
        updatedOrders.forEach((order) => {
            order.order = '';
        });
    }

    // Sets the markers order
    const handleMarkerClick = (index) => {
        if(changedOrder == true) return;
        if(!orders[index].order && orderChange){
            if(orders[index].order.toString() == '') {
                const order = nextIndex;
                const updatedOrders = [...orders];
                updatedOrders[index].order = order;
                setOrders(updatedOrders);
                setNextIndex(order+1);
            }
        }
        if(nextIndex == orders.length-1){
            setChangedOrder(true);
            setOrderChange(false);
            props.reorder(orders);
        }
    }


    // Google API implementation
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyABcH1Lf3VPvHDy8v2y20EytYmBjxHPecU",
    });

    // Shows the map directions between two points
    const showDirections = (start,finish) => {
        const service = new google.maps.DirectionsService();
        service.route({
            origin: start,
            destination: finish,
            travelMode: google.maps.TravelMode.DRIVING,
        },(results, status) => {
            if(status === "OK" && results) setDirections(results);
        });
    }



    

    
    if (!isLoaded) return <div>Loading...</div>

    if(!orders){
        return null;
    }else{
        return (
            <div className={styles.map} coordinates={startLocation}>
                {
                    !started ? 
                    <>
                        <Button variant="success" style={{width: '100vw'}} onClick={() => startDelivery()}> Start </Button>
                        {
                            !changedOrder && orders.length>1 ? 
                            <Button variant="dark" style={{width: '100vw'}} onClick={() => startOrderChange()}>Change Order</Button>
                            :
                            null
                        }   
                    </>
                    :
                    <>
                    {
                        !finished ?
                            <Button style={{width: '100vw'}} onClick={() => nextLocation()}> Next Location </Button>
                        :
                            <Button variant='warning' style={{width: '100vw'}} onClick={() => finishDelivery()}> Finish Order </Button>
                    }
                    </>
                }
                <div className={styles.map}>
                <GoogleMap 
                    zoom={zoom} 
                    center={{lat: 41.323537265467095, lng: 19.817270029913658}} 
                    mapContainerClassName={styles.mapContainer}
                    options={{
                        mapId: 'd5d5ef264e74fd02',
                        mapTypeId: 'roadmap',
                        clickableIcons: false,
                        disableDefaultUI: true
                    }}
                
                >
                {directions && <DirectionsRenderer directions={directions}/>}
                    <Marker 
                        position={startLocation}
                        icon={`${process.env.PUBLIC_URL}/images/rocket.png`}
                    />
                    {
                        orders.map((order, index) => {
                            if(order.show == true){
                                return(
                                    <Marker
                                        key={index}
                                        position={order.coordinates}
                                        label={
                                            `${order.order}`
                                        }
                                        onClick={() => handleMarkerClick(index)}
                                    />
                                )
                            }else{
                                return null
                            }
                        })
                    }
                </GoogleMap>
                </div>
            </div>
        );
    }
}

export default DeliveryMap;