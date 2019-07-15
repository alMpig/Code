import React, { Component } from 'react'; //imrc
import PropTypes from 'prop-types'
import './style.css'

class items  extends Component { //cc
    constructor(props){
        super(props)
        this.handleClick=this.handleClick.bind(this) //改变this指向
    }
    render() { 
        return ( 
            <div onClick={this.handleClick}>
                {this.props.content}  {this.props.avname}
            </div>
         );
    }

    handleClick(){
        this.props.deleteItem(this.props.index)
    }
}
items.propTypes={ //定义类型
    content:PropTypes.string,
    deleteItem:PropTypes.func,
    index:PropTypes.number.isRequired, //必须传
    avname:PropTypes.string
}
items.defaultProps = {
    avname:'松岛枫' //默认值
}
export default items;