import React from 'react';
import './styles.css';

const Header = ({title}) => (
    <header>
        <h1 className="font-weight-bold">{title?title:'Prueba Software Estrategico Api Rest con React/Php Laravel'}</h1>
    </header>
);

export default Header;