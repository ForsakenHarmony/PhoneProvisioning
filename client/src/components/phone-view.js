import { observer } from "mobx-react";
import { Component } from "preact";
import { Button, InputGroup } from "@blueprintjs/core";

export class PhoneView extends Component {
  state = {
    draggable: false
  };

  toggleDraggable(draggable) {
    window.getSelection().removeAllRanges();
    this.setState({ draggable });
  }

  dragStart = e => {
    e.dataTransfer.effectAllowed = "move";
    this.props.startDrag(this.props.id);
  };

  dragEnd = e => {
    this.props.stopDrag();
  };

  render() {
    const {
      phone = {},
      id,
      remove,
      last = false,
      focus = () => {},
      dragged
    } = this.props;
    const { draggable } = this.state;
    return (
      <tr
        key={id}
        id={`phone.${id}`}
        draggable={draggable}
        onDragStart={this.dragStart}
        onDragEnd={this.dragEnd}
        style={dragged ? "opacity: .5" : ""}
      >
        <td>
          {!last && (
            <Button
              icon="menu"
              minimal={true}
              onMouseEnter={this.toggleDraggable.bind(this, true)}
              onMouseLeave={this.toggleDraggable.bind(this, false)}
            />
          )}
        </td>
        <td>
          <InputGroup
            value={phone.name}
            onChange={phone.set && phone.set("name")}
            id={`phone.name.${id}`}
            onFocus={focus}
            placeholder="Name"
          />
        </td>
        <td>
          <InputGroup
            value={phone.number}
            onChange={phone.set && phone.set("number")}
            id={`phone.number.${id}`}
            onFocus={focus}
            placeholder="42"
          />
        </td>
        <td>
          <InputGroup
            value={phone.ip}
            onChange={phone.set && phone.set("ip")}
            id={`phone.ip.${id}`}
            onFocus={focus}
            placeholder="192.168.X.X"
          />
        </td>
        <td>
          {!last && <Button icon="cross" onClick={remove.bind(null, id)} />}
        </td>
      </tr>
    );
  }
}
