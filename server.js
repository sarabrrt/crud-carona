const express = require("express")
const bodyParser = require('body-parser')
const app = express()

const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require("mongodb");
const { restart } = require("nodemon");
const uri = "mongodb+srv://admin:admin@cluster0.lrayh.mongodb.net/test";

app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.json())

MongoClient.connect(uri, (err, client) => {
    if(err) return console.log(err)
    db = client.db('caronapp')

    app.listen(3000, () => {
        console.log('deu certo')
    })
})




//-------------------------MOTORISTA----------------------------
app.get('/motorista', (requisicao, resposta) => {
    db.collection('motorista').find().toArray((err, results) => {
        resposta.send(results)  
    })
})

app.post('/motorista', (requisicao,resposta) => {
    var carro_id = requisicao.body.carro
    
    db.collection('carro').find(ObjectId(carro_id)).toArray((err, result) => {
        if(err) return resposta.send(err)
        if(!result.length) return resposta.status(404).send('Carro não encontrado');
        
        db.collection('motorista').save(requisicao.body, (err, result) => {
            if(err) return console.log(err)
    
            console.log('salvo no banco de dados')
            resposta.send(requisicao.body)
        })
    })
})

app.route('/motorista/:id').patch((requisicao, resposta) =>{
    var motorista_id = requisicao.params.id
    var motorista_nome = requisicao.body.nome
    var motorista_carro = requisicao.body.carro

    db.collection('motorista').find(ObjectId(motorista_id)).toArray((err, result) => {
        if(err) return resposta.send(err)
        if(!result.length) return resposta.status(404).send('Motorista não encontrado');
        
        db.collection('carro').find(ObjectId(motorista_carro)).toArray((err, result) => {
            if(err) return resposta.send(err)
            if(!result.length) return resposta.status(404).send('Carro não encontrado');
            
            db.collection('motorista').updateOne({_id: ObjectId(motorista_id)},{
                $set:{
                    nome: motorista_nome,
                    carro: motorista_carro
                }
            },(err, result) => {
                if(err) return resposta.send(err)
                resposta.send()
            })
        })
    })
})

app.route('/motorista/:id')
.delete((requisicao, resposta) => {
    var motorista_id = requisicao.params.id

    db.collection('motorista').deleteOne({_id: ObjectId(motorista_id)}, (err, result) =>{
        if(err) return resposta.send(err)
        resposta.send()
    })
})


//-------------------------PASSAGEIRO----------------------------


app.get('/passageiro', (requisicao, resposta) => {
    db.collection('passageiro').find().toArray((err, results) => {
        resposta.send(results)  
    })
})

app.post('/passageiro', (requisicao,resposta) => {
    db.collection('passageiro').save(requisicao.body, (err, result) => {
        if(err) return console.log(err)

        console.log('salvo no banco de dados')
    })
    resposta.send(requisicao.body)
})

app.route('/passageiro/:id').patch((requisicao, resposta) =>{
    var passageiro_id = requisicao.params.id
    var passageiro_nome = requisicao.body.nome

    db.collection('passageiro').updateOne({_id: ObjectId(passageiro_id)},{
        $set:{
            nome: passageiro_nome
        }
    },(err, result) => {
        if(err) return resposta.send(err)
        resposta.send()
    })
})

app.route('/passageiro/:id')
.delete((requisicao, resposta) => {
    var passageiro_id = requisicao.params.id

    db.collection('passageiro').deleteOne({_id: ObjectId(passageiro_id)}, (err, result) =>{
        if(err) return resposta.send(err)
        resposta.send()
    })
})




//-------------------------CARRO----------------------------



app.get('/carro', (requisicao, resposta) => {
    db.collection('carro').find().toArray((err, results) => {
        resposta.send(results)  
    })
})

app.post('/carro', (requisicao,resposta) => {
    db.collection('carro').save(requisicao.body, (err, result) => {
        if(err) return console.log(err)

        console.log('salvo no banco de dados')
    })
    resposta.send(requisicao.body)
})

app.route('/carro/:id').patch((requisicao, resposta) =>{
    var carro_id = requisicao.params.id
    var carro_modelo = requisicao.body.modelo
    var carro_capacidade = requisicao.body.capacidade

    db.collection('carro').updateOne({_id: ObjectId(carro_id)},{
        $set:{
            modelo: carro_modelo,
            capacidade: carro_capacidade
        }
    },(err, result) => {
        if(err) return resposta.send(err)
        resposta.send()
    })
})

app.route('/carro/:id')
.delete((requisicao, resposta) => {
    var carro_id = requisicao.params.id

    db.collection('carro').deleteOne({_id: ObjectId(carro_id)}, (err, result) =>{
        if(err) return resposta.send(err)
        resposta.send()
    })
})



//-----------------------CARONA----------------------------

app.get('/carona', (requisicao, resposta) => {
    db.collection('carona').find().toArray((err, results) => {
        resposta.send(results)  
    })
})

app.post('/carona', (requisicao,resposta) => {
    var motorista_id = requisicao.body.motorista_id
    var passageiros = requisicao.body.passageiros
    var carro_id = requisicao.body.carro_id
    
    db.collection('motorista').find(ObjectId(motorista_id)).toArray((err, result) => {
        if(err) return resposta.send(err)
        if(!result.length) return resposta.status(404).send('Motorista não encontrado');

        db.collection('carro').find(ObjectId(carro_id)).toArray((err, result) => {
            if(err) return resposta.send(err)
            if(!result.length) return resposta.status(404).send('Carro não encontrado');
            requisicao.body.qtd_vagas = result[0].capacidade - passageiros.length

            for(let i = 0; i < passageiros.length ; i++) {
                db.collection('passageiro').find(ObjectId(passageiros[i])).toArray((err, result) => {
                    if(err) return resposta.send(err)
                    if(!result.length) return resposta.status(404).send('Passageiro não encontrado');
                    if (i == (passageiros.length - 1)) {
                        db.collection('carona').save(requisicao.body, (err, result) => {
                            if(err) return console.log(err)
                    
                            console.log('salvo no banco de dados')
                            resposta.send(requisicao.body)
                        });
                    }
                })
            }
        });

    })
})

app.route('/carona/:id').patch((requisicao, resposta) =>{
    var carona_id = requisicao.params.id
    var carona_data = requisicao.body.data
    var carona_origem = requisicao.body.origem
    var carona_destino = requisicao.body.destino
    var carona_motorista = requisicao.body.motorista
    var carona_passageiros = requisicao.body.passageiros
    var carona_carro = requisicao.body.carro_id

    db.collection('carona').find(ObjectId(carona_id)).toArray((err, result_carona) => {
        if(err) return resposta.send(err)
        if(!result_carona.length) return resposta.status(404).send('Carona não encontrada');
        if (carona_passageiros.length != result_carona[0].passageiros.length) {
            let passageiro_diferenca = result_carona[0].passageiros.length - carona_passageiros.length;
            var carona_qtd_vagas = result_carona[0].qtd_vagas + passageiro_diferenca;
        }
        db.collection('motorista').find(ObjectId(carona_motorista)).toArray((err, result) => {
            if(err) return resposta.send(err)
            if(!result.length) return resposta.status(404).send('Motorista não encontrado');
    
            db.collection('carro').find(ObjectId(carona_carro)).toArray((err, result) => {
                if(err) return resposta.send(err)
                if(!result.length) return resposta.status(404).send('Carro não encontrado');
    
                for (let i = 0; i < carona_passageiros.length; i++) {
                    db.collection('passageiro').find(ObjectId(carona_passageiros[i])).toArray((err, result) => {
                        if(err) return resposta.send(err)
                        if(!result.length) return resposta.status(404).send('Passageiro não encontrado');
                        if (i == (carona_passageiros.length - 1)) {
                            db.collection('carona').updateOne({_id: ObjectId(carona_id)},{
                                $set:{
                                    data: carona_data || result_carona[0].data,
                                    origem: carona_origem || result_carona[0].origem,
                                    destino: carona_destino || result_carona[0].destino,
                                    qtd_vagas: carona_qtd_vagas || result_carona[0].qtd_vagas,
                                    motorista: carona_motorista || result_carona[0].motorista,
                                    passageiros: carona_passageiros || result_carona[0].passageiros,
                                    carro_id: carona_carro || result_carona[0].carro_id
                                }
                            },(err, result) => {
                                if(err) return resposta.send(err)
                                resposta.send()
                            })
                        }
                    })
                }
            });
        })
    })
    
})

app.route('/carona/:id')
.delete((requisicao, resposta) => {
    var carona_id = requisicao.params.id

    db.collection('carona').deleteOne({_id: ObjectId(carona_id)}, (err, result) =>{
        if(err) return resposta.send(err)
        resposta.send()
    })
})