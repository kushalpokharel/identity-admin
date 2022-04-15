import React, {useEffect, useState} from 'react';
import {collection, deleteDoc, getDocs} from 'firebase/firestore';
import db from './firebase/firebase';
import { doc, updateDoc, setDoc,arrayUnion } from "firebase/firestore";
import {Card, Button, Row, Col, Modal} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {hashPersonalMessage, toBuffer, toRpcSig, ecrecover,ecsign,publicToAddress,bufferToHex, fromUtf8} from 'ethereumjs-util';
import image from './asset/images/1.jpg'

function Home(){
    const [snapshot, setSnapshot] = useState([]);
    const [license, setLicenseSnap] = useState([]);
    const [accept, setAccept] = useState(false);
    const [reject, setReject] = useState(false);
    // const handleCloseAccept = () =>{
    //     setAccept(false);
    // }
    // const handleOpenAccept = () =>{
    //     setAccept(true);
    // }
    // const handleCloseReject = () =>{
    //     setReject(false);
    // }
    // const handleOpenReject = () =>{
    //     setReject(false);
    // }
    let querySnapshot;

    useEffect(async()=>{
        
            // console.log("here");
            querySnapshot = await getDocs(collection(db, "request"));
            let citizen = [];
            let lic = []
            // console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                // console.log(doc.data().objects);
                // console.log(snapshot);
                // setSnapshot(snapshot.push({[doc.id] : doc.data().objects}))
                if(doc.data().citizenship){
                    citizen.push({[doc.id]:doc.data().citizenship});
                }
                if(doc.data().license){
                    lic.push({[doc.id]:doc.data().license});
                }
                
                // doc.data().objects.forEach(map => {
                //     console.log(map);
                // })
            });
            setSnapshot(citizen);
            setLicenseSnap(license);
    },[]);
    console.log(snapshot);
    console.log(license);

    const pushToFirebase = async (object, address) =>{
        const docref = doc(db,"accepted", address);
        const deleteref = doc(db, "request", address);
        try{
            await setDoc(docref, object, {merge:true});
            let filtered = snapshot.filter((obj)=> Object.keys(obj)!=address);
            setSnapshot(filtered);
            await deleteDoc(deleteref);
        }
        catch(e){
            console.log(e);
        }
    }

    const handleClick = (object) => {
            const citizen = Object.values(object)[0];
            console.log(citizen);
            let objects={}
            objects.fullName = citizen.name.firstName+" "+citizen.name.middleName+" "+citizen.name.lastName;
            objects.birthPlace = citizen.birthPlace.vdcMunicipality+" "+citizen.birthPlace.wardno+" "+citizen.birthPlace.district;
            objects.citizenshipNumber = citizen.citizenshipNumber;
            objects.fatherName = citizen.fatherName.firstName+" "+citizen.fatherName.middleName+" "+citizen.fatherName.lastName;
            objects.motherName = citizen.motherName.firstName+" "+citizen.motherName.middleName+" "+citizen.motherName.lastName;
            objects.permanentAddress = citizen.permanentAddress.vdcMunicipality+" "+citizen.permanentAddress.wardno+" "+citizen.permanentAddress.district;
            objects.issuedPlace = citizen.issuedPlace.district;
            let result = {}
            Object.values(objects).map((arrelem, index) =>{
            
            
                console.log(arrelem);
                let dat = fromUtf8(Object.values(arrelem)[0]);
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
                result[Object.keys(objects)[index]] = [sigParams, arrelem];
                // return;
                //function to recover publickey from messageHash and signature
                let publicKey = ecrecover(msgHash, sig.v, sig.r, sig.s)
                let sender = publicToAddress(publicKey);
                console.log(sender);
                let addr = bufferToHex(sender);
                console.log(bufferToHex(msgHash));
                console.log(msgHash, addr);
            })
            const final = {"citizenship":result};
            pushToFirebase(final, Object.keys(object)[0]);

    }


    const handleReject = async (object) =>{
        setReject(true);
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
                let citizen = Object.values(object)[0];
                console.log(Object.values(object)[0]);
                return (
                <>
                <div style={{display:'flex',justifyContent:'center'}}><Card style={{width:'70%',textAlign:'center', margin:'10px'}}>
                    
                    <Card.Header style={{backgroundColor:'lightblue'}}>{Object.keys(object)[0]}</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={1}>
                                    <img src={image} width={60} height={60}/>
                                </Col>
                                <Col xs={5}>
                                    <Row >
                                        <Col>
                                            <Card.Text> Full Name</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.name.firstName+" "+citizen.name.middleName+" "+citizen.name.lastName}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                            <Card.Text> Birth Place</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> District: {citizen.birthPlace.district}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <Col>
                                            
                                        </Col>
                                        <Col>
                                            <Card.Text> Municipality:{citizen.birthPlace.vdcMunicipality+" "+citizen.name.middleName}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Birth Date</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.birthDate}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Father's Name</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.fatherName.firstName+" "+citizen.fatherName.middleName+" "+citizen.fatherName.lastName}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Permanent Address</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.permanentAddress.vdcMunicipality+" "+citizen.permanentAddress.wardno+" "+citizen.permanentAddress.district}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Mother's Name</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.motherName.firstName+" "+citizen.motherName.middleName+" "+citizen.motherName.lastName}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Issued Place</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.issuedPlace.district}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                </Col>
                                <Col xs={5}>
                                <Row >
                                        <Col>
                                            <Card.Text> Gender</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.gender}</Card.Text>
                                        </Col>
                                       
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                            <Card.Text> Ward No.</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.birthPlace.wardno}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <Col>
                                            
                                        </Col>
                                        <Col>
                                            <Card.Text style={{color:"white"}}> Municipality:{citizen.birthPlace.vdcMunicipality+" "+citizen.name.middleName}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                       
                                        <Card.Text style={{color:"white"}}> {citizen.birthDate}</Card.Text>
                                      
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Card.Text style={{color:"white"}}> {citizen.fatherName.firstName+" "+citizen.fatherName.middleName+" "+citizen.fatherName.lastName}</Card.Text>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                    <Card.Text style={{color:"white"}}> {citizen.fatherName.firstName+" "+citizen.fatherName.middleName+" "+citizen.fatherName.lastName}</Card.Text>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                    <Card.Text style={{color:"white"}}> {citizen.fatherName.firstName+" "+citizen.fatherName.middleName+" "+citizen.fatherName.lastName}</Card.Text>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                    <Row >
                                        <Col>
                                        <Card.Text> Issued Date</Card.Text>
                                        </Col>
                                        <Col>
                                            <Card.Text> {citizen.issuedDate}</Card.Text>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <hr style={{backgroundColor:"white"}}/>
                                    </Row> 
                                </Col>
                            </Row>
                        </Card.Body>
                   
                    <div style={{textAlign:'right'}}>
                        <Button variant="primary" style={{margin:'2% 0% 2% 2%'}} onClick={() =>  handleClick(object)}>Accept</Button>
                        <Button variant="danger" style={{margin:'2% 8% 2% 2%'}} onClick={() => handleReject(object)}>Reject</Button>
                    </div>
                </Card> 
                </div>
                {/* <Modal
                        show={accept}
                        onHide={handleCloseAccept}
                        
                >
                    <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAccept}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={trulyAccept}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                </Modal>
                    <Modal
                        show={reject}
                        onHide={handleCloseReject}>
                        <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseReject}>
                          Close
                        </Button>
                        <Button variant="primary" onClick={trulyReject}>
                          Save Changes
                        </Button>
                      </Modal.Footer>
                        </Modal> */}
                </>
                )
            }
        ) 
        // <h1>HI</h1>
    )
}

export default Home;