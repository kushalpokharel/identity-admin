import React, {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import db from './firebase/firebase';

function Home(){
    const [snapshot, setSnapshot] = useState([]);
    let querySnapshot;

    useEffect(async()=>{
        
            console.log("here");
            querySnapshot = await getDocs(collection(db, "request"));
            // console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                // console.log(doc.id);
                // console.log(snapshot);
                // setSnapshot(snapshot.push({[doc.id] : doc.data().objects}))
                
                setSnapshot([...snapshot, {[doc.id]:doc.data().objects}])
                // doc.data().objects.forEach(map => {
                //     console.log(map);
                // })
            });
        
            console.log(snapshot);
    },[]);

    return (
        snapshot.map(object => 
            {
                // console.log(Object.values(object));
                return Object.values(object).map(arrelem => {
                    return arrelem.map( (arrel) =>{
                       console.log(Object.values(arrel)[0]);
                       return <li>{Object.values(arrel)[0]}</li>
                    }
                        
                    )
                    
                });
                
            }
        ) 
        // <h1>HI</h1>
    )
}

export default Home;