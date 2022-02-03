import React, {useEffect, useState} from 'react';
import {collection, deleteDoc, getDocs} from 'firebase/firestore';
import db from './firebase/firebase';
import { doc, updateDoc, setDoc,arrayUnion } from "firebase/firestore";
import {Card, Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {hashPersonalMessage, toBuffer, toRpcSig, ecrecover,ecsign,publicToAddress,bufferToHex, fromUtf8} from 'ethereumjs-util';

function Home(){
    const [snapshot, setSnapshot] = useState([]);
    let querySnapshot;

    useEffect(async()=>{
        
            // console.log("here");
            querySnapshot = await getDocs(collection(db, "request"));
            let snap = [];
            // console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                // console.log(doc.data().objects);
                // console.log(snapshot);
                // setSnapshot(snapshot.push({[doc.id] : doc.data().objects}))
                snap.push({[doc.id]:doc.data().objects});
                
                // doc.data().objects.forEach(map => {
                //     console.log(map);
                // })
            });
            setSnapshot(snap)
    },[]);
    // console.log(snapshot);

    const pushToFirebase = async (objects, address) =>{
        const docref = doc(db,"accepted", address);
        const deleteref = doc(db, "request", address);
        try{
            await setDoc(docref, objects, {merge:true});
            let filtered = snapshot.filter((obj)=> Object.keys(obj)!=address);
            setSnapshot(filtered);
            // await deleteDoc(deleteref);
        }
        catch(e){
            console.log(e);
        }
    }

    const handleClick = (object) => {
            console.log("here")
            let objects = {}
            Object.values(object).map(arrelem =>{
            
                arrelem.map( (arrel) => {
                    console.log(Object.values(arrel)[0])
                    let dat = fromUtf8(Object.values(arrel)[0]);
                    let message = toBuffer(dat);
                    let msgHash = hashPersonalMessage(message);
                    let privateKey = new Buffer.from('556ea9f6abff39f133a43158e0860d543e7f7d7d186d24a2e8627e3dc803686e','hex');
                    let sig = ecsign(msgHash, privateKey);
                    console.log(sig)
                    //converting the signature parameters to eth_rpc form which is equivalent to hex string 
                    //uta client side ma v,r,s recover garda use fromRpcSig
                    let signature = toRpcSig(sig.v,sig.r,sig.s);
                    let sigParams = signature;
                    console.log(sigParams);
                    objects[Object.keys(arrel)] = [sigParams, Object.values(arrel)[0]];
                    return;
                    //function to recover publickey from messageHash and signature
                    let publicKey = ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
                    let sender = publicToAddress(publicKey);
                    let addr = bufferToHex(sender);
                    bufferToHex(msgHash);
                    console.log(msgHash, addr);
                })
                console.log(objects)
                pushToFirebase(objects, Object.keys(object)[0]);
            
        })
    } 

    const handleReject = async (object) =>{
        const address = Object.keys(object)[0];
        const deleteref = doc(db, "request", address);
        // console.log(object)
        let filtered = snapshot.filter((obj)=> Object.keys(obj)[0]!= address);
            setSnapshot(filtered);
            await deleteDoc(deleteref);
    }
    
    return (
        snapshot.map(object => 
            {
                //console.log(Object.values(object));
                return <div style={{display:'flex',justifyContent:'center'}}><Card style={{width:'55%',textAlign:'center', margin:'10px'}}>
                    <Card.Header style={{backgroundColor:'lightblue'}}>{Object.keys(object)[0]}</Card.Header>
                    {

                        Object.values(object).map(arrelem =>{
                        
                            return <Card.Body style={{backgroundColor:'white'}}>
                                {arrelem.map( (arrel) => <div style={{ margin:'2%', display:'flex', justifyContent:'space-between'}} ><div>{Object.keys(arrel)[0].charAt(0).toUpperCase()+Object.keys(arrel)[0].slice(1)}</div> <div style={{marginRight:'5%'}}>{Object.values(arrel)[0].charAt(0).toUpperCase()+Object.values(arrel)[0].slice(1)}</div></div>)}
                            
                            </Card.Body>
                        })
                    
                    }
                    <div style={{textAlign:'right'}}>
                        <Button variant="primary" style={{margin:'2% 0% 2% 2%'}} onClick={() =>  handleClick(object)}>Accept</Button>
                        <Button variant="danger" style={{margin:'2% 8% 2% 2%'}} onClick={() => handleReject(object)}>Reject</Button>
                    </div>
                </Card> 
                </div>
                
                
            }
        ) 
        // <h1>HI</h1>
    )
}

export default Home;