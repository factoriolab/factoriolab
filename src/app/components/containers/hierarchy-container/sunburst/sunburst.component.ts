import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  Arc,
  arc,
  hierarchy,
  HierarchyNode,
  HierarchyRectangularNode,
  interpolate,
  partition,
  ScaleLinear,
  scaleLinear,
  ScalePower,
  scalePow,
  select,
  selectAll,
  Selection,
} from 'd3';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'lab-sunburst',
  templateUrl: './sunburst.component.html',
  styleUrls: ['./sunburst.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunburstComponent implements OnInit, AfterViewChecked {
  static testing = false;

  private _elementWasNull = true;
  private _context: CanvasRenderingContext2D;
  private _browserIsIE: boolean;
  private _ua = window.navigator.userAgent;

  private parentNativeElement: HTMLElement;
  private svg: Selection<any, {}, null, undefined>;
  private nodeId: string;
  private nodeMap: { [key: number]: HierarchyRectangularNode<any> };
  private clipMap: { [key: number]: number };
  private nodeIdMap: { [key: string]: HierarchyRectangularNode<any> };
  private id: string;
  private x: ScaleLinear<number, number>;
  private y: ScalePower<number, number>;
  private arc: Arc<any, HierarchyRectangularNode<any>>;
  private textArc: Arc<any, HierarchyRectangularNode<any>>;
  private rebuild$ = new Subject();

  /** (Default: 600) Duration of transitions in milliseconds */
  @Input()
  transition = SunburstComponent.testing ? 0 : /* istanbul ignore next */ 600;
  /** (Default: 100) Debounce time before rebuilding sunburst, in milliseconds */
  @Input()
  rebuildDebounce = SunburstComponent.testing
    ? 0
    : /* istanbul ignore next */ 100;
  /** (Default: 91) Angle past which text will be flipped upside down. (Mirrored behavior on left side) */
  @Input()
  flipAngle = 91;
  /** (Default: 3) Padding around text in path label, in px */
  @Input()
  padding = 3;
  /** (Default: 3) Minimum number of characters to display in path label */
  @Input()
  minTextLength = 3;
  /** (Default: 10) Minimum path length before any text will be displayed, in px */
  @Input()
  minPathLength = 10;

  /** (Default: 'id') Name of field to use for ids (Not required; if no ID is found sunburst will generate ids) */
  @Input()
  idField = 'id';
  /** (Default: 'name') Name of field to use for label text */
  @Input()
  textField = 'name';
  /** (Default: 'class') Name of field to use for arc class (Optional) */
  @Input()
  classField = 'class';
  /** (Default: 'color') Name of field to use for arc background color (Optional) */
  @Input()
  colorField = 'color';
  /** (Default: 'foreColor') Name of field to use for arc foreground color (Optional) */
  @Input()
  foreColorField = 'foreColor';
  /** (Default: 'children') Name of field to use for children */
  @Input()
  childrenField = 'children';

  private _data;
  /**
   * Data to display in sunburst,
   * e.g. { id: 'id', name: 'name', children: [ { id: 'id2', name: 'child' } ] }
   */
  @Input()
  set data(data: any) {
    this._data = data;
    this.rebuild$.next();
  }
  get data() {
    return this._data;
  }

  private _power = 0.75;
  /**
   * (Default: 0.75) The power to use in sunburst. This affects the sizing of different levels of the sunburst,
   * e.g. at 1, all levels of the sunburst will have equal size.
   */
  @Input()
  set power(power: number) {
    if (this._power !== power) {
      this._power = power;
      this.rebuild$.next();
    }
  }
  get power() {
    return this._power;
  }

  private _diameter = 600;
  /**
   * (Default: 600) Diameter of the sunburst in px. Sunburst will be automatically rebuilt if this changes,
   * recommend using debounce if connected to a resizable element.
   */
  @Input()
  set diameter(diameter: number) {
    if (this._diameter !== diameter) {
      this._diameter = diameter;
      this.rebuild$.next();
    }
  }
  get diameter() {
    return this._diameter;
  }

  /** Emits the currently selected data object  */
  @Output()
  setNode: EventEmitter<any> = new EventEmitter<any>();

  /** Emits the path (array of data objects) to the currently selected data object  */
  @Output()
  setPath: EventEmitter<any[]> = new EventEmitter<any[]>(true);

  /** Use this to select the data object with this id  */
  public selectNode(id: string) {
    if (id && this.nodeIdMap) {
      this.click(this.nodeIdMap[id]);
    }
  }

  private get radius() {
    return this.diameter / 2 - this.padding * 2;
  }

  /**
   * Detect whether current browser is IE/Edge
   * Need to use alternative method for getComputedTextLength if so
   */
  private get browserIsIE() {
    if (this._browserIsIE !== undefined) {
      return this._browserIsIE;
    }

    const msie = this._ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      this._browserIsIE = !!parseInt(
        this._ua.substring(msie + 5, this._ua.indexOf('.', msie)),
        10
      );
      return this._browserIsIE;
    }

    const trident = this._ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      const rv = this._ua.indexOf('rv:');
      this._browserIsIE = !!parseInt(
        this._ua.substring(rv + 3, this._ua.indexOf('.', rv)),
        10
      );
      return this._browserIsIE;
    }

    const edge = this._ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      this._browserIsIE = !!parseInt(
        this._ua.substring(edge + 5, this._ua.indexOf('.', edge)),
        10
      );
      return this._browserIsIE;
    }

    // other browser
    this._browserIsIE = false;
    return this._browserIsIE;
  }

  constructor(element: ElementRef) {
    this.parentNativeElement = element.nativeElement;
    this.id = this.parentNativeElement.id;
    this.x = scaleLinear().range([0, 2 * Math.PI]);
    this.y = scalePow().exponent(this.power).range([0, this.radius]);
  }

  ngOnInit() {
    this.rebuild$
      .pipe(debounceTime(this.rebuildDebounce))
      .subscribe(() => this.rebuildChart());
  }

  ngAfterViewChecked() {
    this.checkElementVisibility();
  }

  // Check whether parent element is visible
  // If parent element becomes visible, rebuild the chart
  private checkElementVisibility() {
    if (this.parentNativeElement.offsetParent !== null) {
      if (this._elementWasNull) {
        this.rebuild$.next();
        this._elementWasNull = false;
      }
    } else {
      this._elementWasNull = true;
    }
  }

  private calculateTextWidth(element: SVGTextPathElement) {
    if (this.browserIsIE === false) {
      // In Chrome/Firefox, we can trust getComputedTextLength
      return element.getComputedTextLength();
    } else {
      // In IE/Edge, getComputedTextLength is wrong, so use measureText as a fallback,
      // it's not as accurate as getComputedTextLength in Chrome/Firefox but works OK.
      if (!this._context) {
        this._context = document.createElement('canvas').getContext('2d');
      }
      const style = window.getComputedStyle(element, null);
      this._context.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return this._context.measureText(element.textContent).width;
    }
  }

  // Get the ID for the passed node
  private idFor(d: HierarchyRectangularNode<any>): string {
    // If an id field is specified, use that.
    if (this.idField) {
      return `${d.data[this.idField]}`;
    }
    // Otherwise, use the number we've assigned.
    for (const id of Object.keys(this.nodeMap)) {
      if (this.nodeMap[id] === d) {
        return `${id}`;
      }
    }
    // Node was not found, return null.
    return null;
  }

  // Return whether the first passed node is a parent of the second passed node
  private isParentOf(p: HierarchyNode<any>, c: HierarchyNode<any>) {
    if (p === c) {
      return true;
    }
    if (p[this.childrenField]) {
      return p[this.childrenField].some((d) => {
        return this.isParentOf(d, c);
      });
    }
    return false;
  }

  // Return whether the passed node should have its text flipped upside down
  private flip(d: HierarchyRectangularNode<any>) {
    const myx = this.x((d.x0 + d.x1) / 2);
    return (
      myx > (this.flipAngle * Math.PI) / 180 &&
      myx < ((360 - this.flipAngle) * Math.PI) / 180
    );
  }

  // Get the length of the hidden arc for the given node
  private pathLength(d: HierarchyRectangularNode<any>) {
    const dx = this.x(d.x1) - this.x(d.x0);
    return (this.y(d.y0) * dx + this.y(d.y1) * dx) / 2;
  }

  // Check whether the passed textPath is too long for the passed path length
  // Accounts for padding on both sides of text as well
  private isTooLong(textPath: SVGTextPathElement, path: number) {
    /* Very difficult to reproduce, but this can sometimes be null */
    /* istanbul ignore if */
    if (!textPath) {
      return true;
    }
    const textLength = this.calculateTextWidth(textPath);
    return path - this.padding * 2 <= textLength;
  }

  // Determine whether text is too long for the given arc
  private isTextTooLong(i: number) {
    const d = this.nodeMap[i];
    const text: string = d.data[this.textField];
    const min =
      text && text.length
        ? Math.min(text.length, this.minTextLength)
        : this.minTextLength;
    if (!text || !text.length) {
      return false;
    }
    // Check whether the path actually has a length
    const pathLength = this.pathLength(d);
    if (pathLength < this.minPathLength) {
      return true;
    }
    const svgTextPath = this.svg.select(`#${this.id}-labelPath${i}`);
    const textPath: SVGTextPathElement = document.getElementById(
      `${this.id}-labelPath${i}`
    ) as any;
    // Save off old text to be restored later
    const oldText = svgTextPath.text();
    // Try min length
    // The transition will handle actually removing characters, at this point we are only
    // interested in whether this text will be hidden at the end of the transition
    svgTextPath.text(`${text.substr(0, min)}...`);
    let bIsTooLong = this.isTooLong(textPath, pathLength);
    /* Edge case that sometimes short text will fit when adding ellipses makes it too long */
    /* istanbul ignore next */
    if (bIsTooLong && text.length) {
      // Test whether full text fits (ellipses take up space too)
      svgTextPath.text(text);
      bIsTooLong = this.isTooLong(textPath, pathLength);
    }
    svgTextPath.text(oldText);
    return bIsTooLong;
  }

  // Sets up a function to set the overflow for the given index
  // This can improve efficiency slightly during transitions
  private getSetTextOverflowFn(i: number) {
    const d = this.nodeMap[i];
    const text: string = d.data[this.textField];
    const min =
      text && text.length
        ? Math.min(text.length, this.minTextLength)
        : this.minTextLength;
    if (!text || !text.length) {
      return () => {};
    }
    const svgTextPath = this.svg.select(`#${this.id}-labelPath${i}`);
    const textPath: SVGTextPathElement = document.getElementById(
      `${this.id}-labelPath${i}`
    ) as any;
    // Return function to set the overflow for the passed index
    return () => {
      // Check whether the path actually has a length
      const pathLength = this.pathLength(d);
      if (pathLength <= this.minPathLength) {
        svgTextPath.text('');
        this.clipMap[i] = text.length;
        return;
      }
      // Save off original text, then try the full text first. (ellipses take up space too)
      let oldText = svgTextPath.text();
      svgTextPath.text(text);
      let bIsTooLong = this.isTooLong(textPath, pathLength);
      if (bIsTooLong) {
        // Full text didn't fit, try min characters.
        svgTextPath.text(`${text.substr(0, min)}...`);
        bIsTooLong = this.isTooLong(textPath, pathLength);
        if (bIsTooLong) {
          // Min characters is too long, clip to nothing.
          svgTextPath.text('');
          this.clipMap[i] = text.length;
          return;
        } else {
          // Full text doesn't fit, min characters does, go back to adjusting text length
          if (oldText === text) {
            // If old text was the full length, we already know that won't fit. Reset to min characters.
            oldText = `${text.substr(0, min)}...`;
            this.clipMap[i] = text.length - min;
          }
          svgTextPath.text(oldText);
          bIsTooLong = this.isTooLong(textPath, pathLength);
        }
      } else {
        // Full text fit, save clip as 0 and exit
        this.clipMap[i] = 0;
        return;
      }
      // Use a binary search style algorithm to find the perfect text length to fit in the path
      const init = text.length - this.clipMap[i];
      let lower = bIsTooLong ? min : init;
      let upper = bIsTooLong ? init : text.length;
      while (true) {
        /* Can't replicate this issue easily. Ignore for code coverage. */
        /* istanbul ignore if */
        if (lower === upper) {
          // Sometimes browser calculates width with ellipsis as shorter for some reason
          // If we get stuck like this, just clip to 0 and break out
          svgTextPath.text('');
          this.clipMap[i] = text.length;
          return;
        }
        const add = Math.round((upper - lower) / 2);
        const mid = lower + add;
        svgTextPath.text(`${text.substr(0, mid)}...`);
        bIsTooLong = this.isTooLong(textPath, pathLength);
        if (bIsTooLong) {
          if (add === 1) {
            const clip = text.length - mid + 1;
            this.clipMap[i] = clip;
            svgTextPath.text(`${text.substr(0, text.length - clip)}...`);
            return;
          }
          upper = mid;
        } else {
          lower = mid;
        }
      }
    };
  }

  // Get proper offset (orientation/flip) for node - 25% = up, 75% = down
  private startOffset(d: HierarchyRectangularNode<any>) {
    return this.flip(d) ? '75%' : '25%';
  }

  // Rebuild the chart with new data/size settings
  rebuildChart() {
    this.y = scalePow().exponent(this.power).range([0, this.radius]);
    if (this.svg) {
      select(`#${this.id}-svg`).remove();
    }
    this.createChart();
  }

  // Build and display the sunburst control
  createChart() {
    if (!this.data) {
      return;
    }

    // Declare partition and arcs
    const part = partition<any>();
    this.arc = arc<HierarchyRectangularNode<any>>()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, this.y(d.y0)))
      .outerRadius((d) => Math.max(0, this.y(d.y1)));
    this.textArc = arc<HierarchyRectangularNode<any>>()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2))
      .outerRadius((d) => Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2));

    // Create SVG
    this.svg = select(this.parentNativeElement)
      .append('svg')
      .attr('id', `${this.id}-svg`)
      .attr('width', this.diameter)
      .attr('height', this.diameter)
      .append('g')
      .attr(
        'transform',
        `translate(${this.diameter / 2},${this.diameter / 2})`
      );

    // Set up hierarchy & counts
    const root = hierarchy(this.data, (d) => d[this.childrenField]);
    root.sum((d) => (d[this.childrenField] ? 0 : 1));

    // Get sunburst paths
    const sunburst = this.svg
      .selectAll('path')
      .data(part(root).descendants())
      .enter();

    this.nodeMap = {};
    this.nodeIdMap = {};
    this.clipMap = {};
    const oldId = this.nodeId;
    let rootId: string;
    let newId: string;
    this.nodeId = null;
    // Append main arcs with fills
    const arcs = sunburst
      .append('path')
      .attr('d', this.arc)
      .each((d, i) => {
        this.nodeMap[i] = d;
        this.clipMap[i] = 0;
        // Map out IDs, see if old selected ID still exists and reselect it if so.
        const dId = this.idFor(d);
        this.nodeIdMap[dId] = d;
        if (dId === oldId) {
          newId = dId;
        }
        if (!rootId) {
          rootId = dId;
        }
      })
      .attr('class', (d) => {
        return d.data[this.classField]
          ? `arc ${d.data[this.classField]}`
          : 'arc';
      })
      .attr('style', (d) => {
        return d.data[this.colorField]
          ? `fill: ${d.data[this.colorField]}`
          : null;
      })
      .attr('cursor', (d) => (d.depth === 0 ? 'default' : 'pointer'))
      .attr('id', (d, i) => `${this.id}-arc${i}`)
      .on('click', (d) => this.click(d))
      .on('mouseover', (d, i) => {
        // Set 'hover' class on all elements on mouse enter
        // 'hover' class can be leveraged by css to change styles
        select(document.getElementById(`${this.id}-arc${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `arc hover ${d.data[this.classField]}`
            : 'arc hover'
        );
        select(document.getElementById(`${this.id}-hiddenArc${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `hiddenArc hover ${d.data[this.classField]}`
            : 'hiddenArc hover'
        );
        select(document.getElementById(`${this.id}-labelText${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `labelText hover ${d.data[this.classField]}`
            : 'labelText hover'
        );
        select(document.getElementById(`${this.id}-labelPath${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `labelPath hover ${d.data[this.classField]}`
            : 'labelPath hover'
        );
      })
      .on('mouseleave', (d, i) => {
        // Remove 'hover' class from all elements on mouse leave
        select(document.getElementById(`${this.id}-arc${i}`)).attr(
          'class',
          d.data[this.classField] ? `arc ${d.data[this.classField]}` : 'arc'
        );
        select(document.getElementById(`${this.id}-hiddenArc${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `hiddenArc ${d.data[this.classField]}`
            : 'hiddenArc'
        );
        select(document.getElementById(`${this.id}-labelText${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `labelText ${d.data[this.classField]}`
            : 'labelText'
        );
        select(document.getElementById(`${this.id}-labelPath${i}`)).attr(
          'class',
          d.data[this.classField]
            ? `labelPath ${d.data[this.classField]}`
            : 'labelPath'
        );
      });

    // Append hover title
    arcs.append('title').text((d, i) => d.data[this.textField]);

    // Append hidden arcs for labels
    sunburst
      .append('path')
      .attr('d', (d) => this.textArc(d))
      .attr('class', (d) => {
        return d.data[this.classField]
          ? `hiddenArc ${d.data[this.classField]}`
          : 'hiddenArc';
      })
      .attr('id', (d, i) => `${this.id}-hiddenArc${i}`)
      .style('display', 'none');

    // Append labels
    let offset: number;
    const text = sunburst
      .append('text')
      .attr('class', (d) => {
        return d.data[this.classField]
          ? `labelText ${d.data[this.classField]}`
          : 'labelText';
      })
      .attr('id', (d, i) => `${this.id}-labelText${i}`)
      .attr('dy', (d, i) => {
        if (!offset) {
          // Just calculate this once...
          // Note: For some reason this seems to look best when dividing by three, rather than dividing by two
          // as you would intuitively assume. Honestly, I'm not sure why, presumably the text renders smaller.
          const labelText = document.getElementById(`${this.id}-labelText${i}`);
          /* Covers edge case that it can't find the label text. Ignore for code coverage */
          /* istanbul ignore else */
          if (labelText) {
            offset =
              parseFloat(window.getComputedStyle(labelText).fontSize) / 3;
          }
        }
        return offset;
      })
      .attr('cursor', (d) => (d.depth === 0 ? 'default' : 'pointer'))
      .style('pointer-events', 'none');
    const path = text
      .append('textPath')
      .attr('id', (d, i) => `${this.id}-labelPath${i}`)
      .attr('class', (d) => {
        return d.data[this.classField]
          ? `labelPath ${d.data[this.classField]}`
          : 'labelPath';
      })
      .attr('style', (d) => {
        return d.data[this.foreColorField]
          ? `fill: ${d.data[this.foreColorField]}`
          : null;
      })
      .attr('startOffset', (d) => this.startOffset(d))
      .style('text-anchor', 'middle')
      .attr('href', (d, i) => `#${this.id}-hiddenArc${i}`)
      .text((d) => d.data[this.textField]);
    text
      .each((d, i) => {
        this.getSetTextOverflowFn(i)();
      })
      .style('visibility', (d, i) => (this.isTextTooLong(i) ? 'hidden' : null));

    if (newId && this.nodeIdMap[newId]) {
      this.click(this.nodeIdMap[newId]);
    } else if (oldId && this.nodeIdMap[rootId]) {
      this.click(this.nodeIdMap[rootId]);
    } else {
      this.click(this.nodeIdMap[rootId]);
      // this.path.emit([]);
    }
  }

  // Select the passed node
  click(d: HierarchyRectangularNode<any>) {
    // Ignore if the passed node is null
    if (!d) {
      return;
    }
    const dId = this.idFor(d);
    if (dId == null) {
      return;
    }
    if (this.nodeId && this.nodeId === dId) {
      // Ignore if the passed node is the root and is already selected.
      if (d.depth === 0) {
        return;
      }
      // This non-root node is already selected. Select the root node instead.
      // This will reset the sunburst, essentially 'unselecting' the selected node.
      this.click(this.nodeMap[0]);
      return;
    }

    this.nodeId = dId;

    // Emit component events
    this.setNode.emit(d.data); // Emit selected node
    const path = [d.data];
    let p = d;
    while (p.parent) {
      path.unshift(p.parent.data);
      p = p.parent;
    }
    this.setPath.emit(path); // Emit selected path

    // Set up interpolations to new selected item
    const xd = interpolate(this.x.domain(), [d.x0, d.x1]);
    const yd = interpolate(this.y.domain(), [d.y0, 1]);
    const yr = interpolate(this.y.range(), [d.y0 ? 20 : 0, this.radius]);

    // Mock up transition to new selected item (1 = after transition)
    this.x.domain(xd(1));
    this.y.domain(yd(1)).range(yr(1));
    selectAll('path.hiddenArc').attr('d', (e: HierarchyRectangularNode<any>) =>
      this.textArc(e)
    );

    // Measure whether the labels will fit after transition
    const hideMap: { [key: number]: boolean } = {};
    let i = 0;
    while (this.nodeMap[i]) {
      hideMap[i] = this.isTextTooLong(i++);
    }

    // Reset back to original scale so transition can occur (0 = before transition)
    this.x.domain(xd(0));
    this.y.domain(yd(0)).range(yr(0));
    selectAll('path.hiddenArc').attr('d', (e: HierarchyRectangularNode<any>) =>
      this.textArc(e)
    );

    // Set up transition
    const pathTransition = this.svg
      .transition()
      .duration(this.transition)
      .tween('scale', () => {
        return (t) => {
          this.x.domain(xd(t));
          this.y.domain(yd(t)).range(yr(t));
        };
      });

    // Transition arcs
    pathTransition
      .selectAll('path.arc')
      .attrTween('d', (e: HierarchyRectangularNode<any>) => () => this.arc(e));
    pathTransition
      .selectAll('path.hiddenArc')
      .attrTween('d', (e: HierarchyRectangularNode<any>) => () =>
        this.textArc(e)
      );

    // Set up arc pointers (depth 0 should only have pointer when it is not the selected node)
    this.svg
      .selectAll('path.arc')
      .attr('cursor', (e: HierarchyRectangularNode<any>) => {
        return d.depth === 0 && e.depth === 0 ? 'default' : 'pointer';
      });

    // Set up pointers and initial visibility for labels
    this.svg
      .selectAll('text')
      .style('visibility', (e: HierarchyRectangularNode<any>, j) => {
        return this.isParentOf(d, e) && !hideMap[j]
          ? null
          : select(document.getElementById(`${this.id}-labelText${j}`)).style(
              'visibility'
            );
      })
      .attr('cursor', (e: HierarchyRectangularNode<any>) => {
        return d.depth === 0 && e.depth === 0 ? 'default' : 'pointer';
      })
      // Set up transition for labels
      .transition()
      .duration(this.transition)
      .style('fill-opacity', (e: HierarchyRectangularNode<any>, j) => {
        return this.isParentOf(d, e) && !hideMap[j] ? 1 : 1e-6;
      })
      .on('end', (e: HierarchyRectangularNode<any>, j) => {
        select(document.getElementById(`${this.id}-labelText${j}`)).style(
          'visibility',
          this.isParentOf(d, e) && !hideMap[j] ? null : 'hidden'
        );
      });

    // Set up transition for text offset (text orientation/flip) and clipping
    this.svg
      .selectAll('textPath')
      .transition()
      .duration(this.transition)
      .attrTween('startOffset', (e: HierarchyRectangularNode<any>) => {
        return () => this.startOffset(e);
      })
      .tween('text', (e, j) => {
        return this.getSetTextOverflowFn(j);
      });
  }
}
