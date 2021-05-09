const express = require('express')
//Requisição da uuid
const { v4: uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = [];

/** DADOS DA CONTA
 * cpf - string => recebe do cliente
 * name - string => recebe do cliente
 * id - uuid  => app cria
 * statement (lançamentos) - [] 
 */

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
app.get('/statement/:cpf', (req,res) => {
    const{cpf} = req.params
    const custumer = customers.find(costumer =>
        costumer.cpf===cpf)

// verificando se existe o customer 
if(!custumer){
    return res.status(400).json({error:"Customer not found"})

}
        return res.json(custumer.statement)
})
app.listen(3333)