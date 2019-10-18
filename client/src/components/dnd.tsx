import { Component, RenderableProps, VNode, ComponentChildren } from "preact";

interface EventHandler<E extends Event> {
  (event: E): void;
}

interface HandleProps {
  onMouseDown: EventHandler<any>;
  onMouseUp: EventHandler<any>;
}

interface ContainerProps {
  children: ComponentChildren;
  [key: string]: any;
}

interface ItemProps<T, K extends keyof T> {
  key: T[K];
  data: T;
  handle: VNode<any> | null;
  draggable: boolean;
  over: boolean;
  onDragStart: EventHandler<any>;
  onDragEnd: EventHandler<any>;
  onDragOver: EventHandler<any>;
  onDrop: EventHandler<any>;
  role: "option";
  "aria-grabbed": boolean;
}

interface Props<T extends { [key: string]: any }, K extends keyof T> {
  container: (props: ContainerProps) => VNode<any> | null;
  item: (props: ItemProps<T, K>) => VNode<any> | null;
  items: T[];
  handle?: (props: HandleProps) => VNode<any>;
  prop: K;
  onMove: (from: T[K], to: T[K]) => void;
  onSort: (newItems: T[]) => void;
}

interface State {
  dragging: boolean;
  draggable: number;
  dragged: number;
  over: number;
}

interface EventThing extends Event {
  target: Element;
  dataTransfer: DataTransfer | null;
}

export class DnD<T extends { [key: string]: any }, K extends keyof T> extends Component<
  Props<T, K>,
  State
> {
  state: State = {
    dragging: false,
    draggable: -1,
    dragged: -1,
    over: -1
  };

  static defaultProps: Partial<Props<any, any>> = {
    container: ({ children, ...props }) => <ul {...props}>{children}</ul>,
    item: ({ data }) => <li>{JSON.stringify(data)}</li>,
    onSort: () => {},
    onMove: (from, to) => {},
    prop: "id"
  };

  onMouseDown(idx: number) {
    this.setState({
      draggable: idx
    });
  }

  onMouseUp() {
    this.setState({
      draggable: -1
    });
  }

  dragStart(idx: number, e: EventThing) {
    if (e.target.getAttribute("draggable") === "false") return;

    e.dataTransfer!.setData(
      "application/json",
      JSON.stringify(this.props.items[idx])
    );
    e.dataTransfer!.effectAllowed = "move";

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

  dragOver(idx: number, e: EventThing) {
    this.setState({
      over: idx
    });

    if (idx === this.state.dragged) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
  }

  drop(target: number, e: EventThing) {
    const { dragged } = this.state;

    if (dragged === target) return;

    const newItems = this.props.items.slice();

    newItems.splice(target, 0, newItems.splice(dragged, 1)[0]);

    const items = this.props.items;
    const prop = this.props.prop;
    this.props.onMove(items[dragged][prop], items[target][prop]);
    this.props.onSort(newItems);
  }

  render(
    {
      container: Container,
      item: Item,
      items,
      handle: Handle,
      prop,
      onMove
    }: RenderableProps<Props<T, K>>,
    { dragged, dragging, over, draggable }: State,
    {}
  ) {
    let newItems = dragging && over !== dragged ? items.slice() : items;

    if (dragging && over !== dragged) {
      newItems.splice(over, 0, newItems.splice(dragged, 1)[0]);
    }

    return Container({
      "aria-dropeffect": "move",
      children: newItems.map((data: T, idx: number) =>
        Item({
          key: data[prop],
          data: data,
          handle: Handle
            ? Handle({
                onMouseDown: this.onMouseDown.bind(this, idx),
                onMouseUp: this.onMouseUp.bind(this)
              })
            : null,
          draggable: !Handle || draggable === idx,
          over: dragging && idx === over,
          onDragStart: this.dragStart.bind(this, idx),
          onDragEnd: this.dragEnd.bind(this),
          onDragOver: this.dragOver.bind(this, idx),
          onDrop: this.drop.bind(this, idx),
          role: "option",
          "aria-grabbed": dragging && idx === over
        })
      )
    });
  }
}
