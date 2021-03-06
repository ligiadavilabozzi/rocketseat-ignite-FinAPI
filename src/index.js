const express = require('express')
//Requisição da uuid
const {
    v4: uuidv4
} = require('uuid')

const app = express()

app.use(express.json())

const customers = [];

function verifyIfExistsAccountCPF(req, res, next) {
    const {
        cpf
    } = req.headers
    const customer = customers.find(customer =>
        customer.cpf === cpf)
    // verificando se existe o customer 
    if (!customer) {
        return res.status(400).json({
            error: "Customer not found"
        })
    }
    req.customer = customer
    return next();
}

//pegar tudo que entrou com crédito e saiu, vamos usar o reduce
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => { //o reduce pega as infos de um valor e transforma todos valores em um único, queremos que ela calcule o que entrou e o que saiu
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0) //valor de inicio do reduce. 
    return balance;
}




app.post('/account', (req, res) => {
    const {
        cpf,
        name
    } = req.body;
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return res.status(400).json({
            error: "Customer already exists!"
        })
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
app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
    const {
        customer
    } = req
    return res.json(customer.statement)
})

//Criando Depósito na conta
app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
    const {
        description,
        amount
    } = req.body
    const {
        customer
    } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return res.status(201).send()
})

//Criando Saque na conta / verificando se pode sacar
app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
    const {
        amount
    } = req.body
    const {
        customer
    } = req
    const balance = getBalance(customer.statement) //entre ( ) é onde ficaram os valores
    if (balance < amount) {
        return res.status(400).json({
            error: "Insufficient funds!"
        })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }
    customer.statement.push(statementOperation);
    return res.status(201).send();
})

//Busca do extrato por data
app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const {
        customer
    } = req
    const {
        date
    } = req.query

    const dateFormat = new Date(date + " 00:00")

    const statement = customer.statement.filter(
        (statement) =>
        statement.created_at.toDateString() ===
        new Date(dateFormat).toDateString()
    )
    return res.json(statement)
})

// Altera dados (nome)
app.put('/account', verifyIfExistsAccountCPF, (req, res) => {

    const {
        name
    } = req.body
    const {
        customer
    } = req
    customer.name = name;
    return res.status(201).send()
});

//Retorna dados da conta 
app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
    const {
        customer
    } = req
    return res.json(customer);
});

//Excluir conta
app.delete('/account', verifyIfExistsAccountCPF, (req, res) => {
    const {
        customer
    } = req
    customers.splice(customer, 1);
    return res.status(200).json(customers);
})

//Retornando o balance (quanto tem em conta)
app.get('/balance', verifyIfExistsAccountCPF,(req,res)=>{
const {customer} = req
const balance = getBalance(customer.statement)
return res.json(balance)
})

app.listen(3333)