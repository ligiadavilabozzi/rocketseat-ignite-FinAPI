const express = require('express')
//Requisição da uuid
const { v4: uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = [];

function verifyIfExistsAccountCPF(req,res,next){
    const{cpf} = req.headers
    const customer = customers.find(customer =>
        customer.cpf===cpf)
        // verificando se existe o customer 
if(!customer){
    return res.status(400).json({error:"Customer not found"})
}
req.customer = customer 
return next();
}

app.post('/account', (req, res) => {
    const {cpf, name} = req.body;
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );
    
    if(customerAlreadyExists){
        return res.status(400).json({error:"Customer already exists!"})
    }
    
    //inserção de dados na array costumers 
    customers.push({
        cpf,
        name,
        id: uuidv4(), //atribuição de uma id
        statement: []
    });
    
    //retorno para ver se deu certo: 
    return res.status(201).send();
});

//Listando Extrato
app.get('/statement', verifyIfExistsAccountCPF, (req,res) => {
const {customer} = req
        return res.json(customer.statement)
})
app.listen(3333)