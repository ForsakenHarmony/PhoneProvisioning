class DnD extends Component {
  state = {
    dragging: false,
    draggable: -1,
    dragged: -1,
    over: -1
  };

  onMouseDown(idx) {
    this.setState({
      draggable: idx
    });
  }

  onMouseUp() {
    this.setState({
      draggable: -1
    });
  }

  dragStart(idx, e) {
    if (e.target.getAttribute("draggable") === "false") return;

    e.dataTransfer.setData("application/json", JSON.stringify(this.item));
    e.dataTransfer.effectAllowed = "move";

    this.setState({
      dragging: true,
      dragged: idx,
      over: idx
    });
  }

  dragEnd() {
    this.setState({
      dragging: false,
      draggable: -1,
      dragged: -1,
      over: -1
    });
  }

  dragOver(idx, e) {
    this.setState({
      over: idx
    });

    if (idx === this.state.dragged) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
  }

  drop(target, e) {
    const { dragged } = this.state;

    if (dragged === target) return;

    const newItems = this.props.items.slice();

    newItems.splice(target, 0, newItems.splice(dragged, 1)[0]);

    this.props.onSort(newItems);
  }

  render(
    { container: Container, item: Item, items, handle: Handle, prop, onSort },
    { dragged, dragging, over, draggable }
  ) {
    let newItems = dragging && over !== dragged ? items.slice() : items;

    if (dragging && over !== dragged) {
      newItems.splice(over, 0, newItems.splice(dragged, 1)[0]);
    }

    return (
      <Container aria-dropeffect="move">
        {newItems.map((data, idx) => (
          <Item
            key={data[prop]}
            data={data}
            handle={
              <Handle
                onMouseDown={this.onMouseDown.bind(this, idx)}
                onMouseUp={this.onMouseUp.bind(this)}
              />
            }
            draggable={!Handle || draggable === idx}
            over={dragging && idx === over}
            onDragStart={this.dragStart.bind(this, idx)}
            onDragEnd={this.dragEnd.bind(this)}
            onDragOver={this.dragOver.bind(this, idx)}
            onDrop={this.drop.bind(this, idx)}
            role="option"
            aria-grabbed={dragging && idx === over}
          />
        ))}
      </Container>
    );
  }
}