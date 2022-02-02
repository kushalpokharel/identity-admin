import React, {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import db from './firebase/firebase';
import {Card, Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home(){
    const [snapshot, setSnapshot] = useState([]);
    let querySnapshot;

    useEffect(async()=>{
        
            console.log("here");
            querySnapshot = await getDocs(collection(db, "request"));
            let snap = [];
            // console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                console.log(doc.data().objects);
                // console.log(snapshot);
                // setSnapshot(snapshot.push({[doc.id] : doc.data().objects}))
                snap.push({[doc.id]:doc.data().objects});
                
                // doc.data().objects.forEach(map => {
                //     console.log(map);
                // })
            });
            setSnapshot(snap)
    },[]);
    console.log(snapshot);
    
    return (
        snapshot.map(object => 
            {
                console.log(Object.values(object));
                return <div style={{display:'flex',justifyContent:'center'}}><Card style={{width:'55%',textAlign:'center', margin:'10px'}}>
                    <Card.Header style={{backgroundColor:'lightblue'}}>{Object.keys(object)}</Card.Header>
                    {

                        Object.values(object).map(arrelem =>{
                        
                            return <Card.Body style={{backgroundColor:'white'}}>
                                {arrelem.map( (arrel) => <div style={{ margin:'2%', display:'flex', justifyContent:'space-between'}} ><div>{Object.keys(arrel)[0].charAt(0).toUpperCase()+Object.keys(arrel)[0].slice(1)}</div> <div style={{marginRight:'5%'}}>{Object.values(arrel)[0].charAt(0).toUpperCase()+Object.values(arrel)[0].slice(1)}</div></div>)}
                            
                            </Card.Body>
                        })
                    
                    }
                    <div style={{textAlign:'right'}}>
                        <Button variant="primary" style={{margin:'2% 0% 2% 2%'}}>Accept</Button>
                        <Button variant="danger" style={{margin:'2% 8% 2% 2%'}}>Reject</Button>
                    </div>
                </Card> 
                </div>
                
                
            }
        ) 
        // <h1>HI</h1>
    )
}

export default Home;