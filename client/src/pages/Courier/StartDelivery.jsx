import {Button, Alert} from 'react-bootstrap';
import api from '../../api';
import {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { AuthContext } from '../../context/Context';

const StartDelivery = () => {
    const navigate = useNavigate();

    const {role, loaded} = useContext(AuthContext);
    const [deliveryLoaded, setDeliveryLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        api.getCourierDelivery().then((res) => {
            if(res.data.delivery){
                navigate(`${process.env.PUBLIC_URL}/courier/delivery/${res.data.delivery._id}`);
            }
            setDeliveryLoaded(true);
        });
    }, []);

    useEffect(() => {
        if(loaded && role != "Courier"){
            navigate(`${process.env.PUBLIC_URL}/login`);
        }
    }, [role, loaded])

    const handleClick = () => {
        api.getNewDelivery().then((res) => {
            if(!res.data.success) {
                setFailed(true);
                return;
            }
            navigate(`${process.env.PUBLIC_URL}/courier/delivery/${res.data.deliveryId}`);
        });
    }

    if(role == "Courier" && deliveryLoaded){
        return (
            <div>
                {
                    failed ?
                    <Alert variant={'danger'}>
                        There are no items to deliver at the moment!
                    </Alert>
                    :
                    null
                }
                <Button style={{marginTop: 50}} onClick={handleClick}>Start Delivery</Button>
            </div>
        )
    }else{
        return null;
    }
}

export default StartDelivery;