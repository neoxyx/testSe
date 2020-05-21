import React, {Component} from 'react';
import PubSub from 'pubsub-js';
import { 
    Table,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Alert
} from 'reactstrap';
class FormProduct extends Component {

    state = { model: {id:0, name:'',ref:'',price:'',weight:'',category:'',stock:''}};

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    };

    create = () => {        
        this.setState({model: {id:0, name:'',ref:'',price:0,weight:0,category:'',stock:0}})
        this.props.productCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-product', (topic, product) => {
            this.setState({model:product});
        })
    }

    render() {
        const errors = this.state;
        return (
            <Form>
                <FormGroup>
                    <Label for="name">Nombre:</Label>
                    <Input id="name" type="text" value={this.state.model.name} placeholder="Nombre Producto..." onChange={e => this.setValues(e, 'name')} />
                    {errors.model.name && <p>{errors.model.name}</p>}
                </FormGroup>
                <FormGroup>
                    <Label for="category">Categoria:</Label>
                    <Input id="category" type="text" value={this.state.model.category} placeholder="Categoria..." onChange={e => this.setValues(e, 'category')}></Input>
                </FormGroup>
                <FormGroup>
                    <div className="form-row">
                        <div className="col-md-6">
                            <Label for="price">Precio:</Label>
                            <Input id="price" type="number" value={this.state.model.price} placeholder="COP$" onChange={e => this.setValues(e, 'price')} />
                        </div>
                        <div className="col-md-6">
                            <Label for="weight">Peso:</Label>
                            <Input id="weight" type="number" value={this.state.model.weight} onChange={e => this.setValues(e, 'weight')} />
                        </div>
                    </div>
                </FormGroup>
                <FormGroup>
                    <div className="form-row">
                        <div className="col-md-6">
                            <Label for="stock">Stock:</Label>
                            <Input id="stock" type="number" value={this.state.model.stock} placeholder="# productos disponibles" onChange={e => this.setValues(e, 'stock')} />
                        </div>
                        <div className="col-md-6">
                            <Label for="ref">Referencia:</Label>
                            <Input id="ref" type="text" value={this.state.model.ref} onChange={e => this.setValues(e, 'ref')} />
                        </div>
                    </div>
                </FormGroup>
                <Button color="primary" block onClick={this.create}>Guardar</Button>
            </Form>
        )
    }
}

class ListProduct extends Component {

    delete = (id) => {
        this.props.deleteProduct(id);
    }

    onEdit = (product) => {
        PubSub.publish('edit-product', product);
    }

    render() {
        const { products } = this.props;
        return (
            <Table className="table-bordered text-center">
                <thead className="thead-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Referencia</th>
                        <th>Precio</th>
                        <th>Peso</th>
                        <th>Categoria</th>
                        <th>Stock</th>
                        <th>Fecha Creado</th>
                        <th>Fecha Ult. Venta</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.ref}</td>
                                <td>{product.price}</td>
                                <td>{product.weight}</td>
                                <td>{product.category}</td>
                                <td>{product.stock}</td>
                                <td>{product.created_at}</td>
                                <td>{product.updated_at}</td>
                                <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(product)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(product.id)}>Eliminar</Button>
                                    <Button color="success" size="sm">Vender</Button>
                                </td>
                            </tr> 
                        ))
                    }
                </tbody>
            </Table>
        )
    }
}

export default class ProductBox extends Component {

    Url = 'http://127.0.0.1:8000/api/products';

    state = {
        products: [],
        message: {
            text: '',
            alert: ''
        },
        errors: {
            name: 'Campo Obligatorio',
            price: 'Campo Obligatorio',
            weight: 'Campo Obligatorio',
            category: 'Campo Obligatorio',
            stock: 'Campo Obligatorio',
            ref: 'Campo Obligatorio'
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(products => this.setState({products}))
            .catch(e => console.log(e));
    }

    save = (product) => {
        let data = {
            id: parseInt(product.id),
            name: product.name,
            price: parseInt(product.price),
            weight: parseInt(product.weight),
            category: product.category,
            stock: parseInt(product.stock),
            ref: product.ref
        };
        const requestInfo = {
            method: data.id !== 0? 'PUT': 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-type': 'application/json'
            })
        };

        if(data.id === 0) {
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newProduct => {
                let {products} = this.state;
                products.push(newProduct);
                this.setState({products, message: { text: 'Producto agregado exitosamente!', alert:'success'}});
                this.timerMessage(3000);
            })
            .catch(e => console.log(e));
        } else {
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedProduct => {
                let {products} = this.state;
                let position = products.findIndex(product => product.id === data.id);
                products[position] = updatedProduct;
                this.setState({products, message: { text: 'Producto actualizado exitosamente!', alert:'info'}});
                this.timerMessage(3000);
            })
            .catch(e => console.log(e));
        }        
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method:'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const products = this.state.products.filter(product => product.id !== id);
                this.setState({products, message: { text: 'Producto eliminado exitosamente!', alert:'danger'}});
                this.timerMessage(3000);
            })
            .catch(e => console.log(e));
    }

    timerMessage = (duration) => {
        setTimeout(() => {
           this.setState({message: {text: '', alert:''}}); 
        }, duration);
    }

    render() {
        return (
            <div>
                {
                    this.state.message.text !== '' ? (
                        <Alert color={this.state.message.alert} className="text-center">{this.state.message.text}</Alert>
                    ) : ''
                }
                <div className="row">                    
                    <div className="col-md-3 my-3">
                        <h2 className="font-weight-bold text-center">
                        Registro de Productos
                        </h2>
                        <FormProduct productCreate={this.save} />
                    </div>
                    <div className="col-md-6 my-3">                        
                        <h2 className="font-weight-bold text-center">
                        Lista de Productos
                        </h2>                
                        <ListProduct products={this.state.products} deleteProduct={this.delete}/>
                    </div>
                </div>                
            </div>
        );
    }

}