import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import * as d3 from 'd3';

import { Node } from '~/models';

type HierarchyRectangularNode = d3.HierarchyRectangularNode<Node>;

@Component({
  selector: 'lab-sunburst',
  templateUrl: './sunburst.component.html',
  styleUrls: ['./sunburst.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunburstComponent {
  static transition = 600;

  parentNativeElement: HTMLElement;
  svg: d3.Selection<any, {}, null, undefined>;
  nodeId: string;
  nodeMap: { [key: number]: HierarchyRectangularNode };
  clipMap: { [key: number]: number };
  nodeIdMap: { [key: string]: HierarchyRectangularNode };
  id: string;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScalePower<number, number>;
  arc: d3.Arc<any, HierarchyRectangularNode>;
  textArc: d3.Arc<any, HierarchyRectangularNode>;
  power = 0.75;
  padding = 3;
  minTextLength = 3;
  minPathLength = 10;

  _data: Node;
  @Input()
  set data(data: Node) {
    this._data = data;
    this.rebuildChart();
  }
  get data() {
    return this._data;
  }

  _diameter = 600;
  @Input()
  set diameter(diameter: number) {
    if (this._diameter !== diameter) {
      this._diameter = diameter;
      this.rebuildChart();
    }
  }
  get diameter() {
    return this._diameter;
  }

  @Output() setNode = new EventEmitter<Node>();
  @Output() setPath = new EventEmitter<Node[]>(true);

  /** Use this to select the data object with this id  */
  public selectNode(id: string) {
    if (id && this.nodeIdMap) {
      this.click(this.nodeIdMap[id]);
    }
  }

  get radius() {
    return this.diameter / 2 - this.padding * 2;
  }

  constructor(element: ElementRef) {
    this.parentNativeElement = element.nativeElement;
    this.id = this.parentNativeElement.id;
    this.x = d3.scaleLinear().range([0, 2 * Math.PI]);
    this.y = d3.scalePow().exponent(this.power).range([0, this.radius]);
  }

  /** Return whether the first passed node is a parent of the second passed node */
  isParentOf(p: d3.HierarchyNode<Node>, c: d3.HierarchyNode<Node>) {
    if (p === c) {
      return true;
    }
    if (p.children) {
      return p.children.some((d) => {
        return this.isParentOf(d, c);
      });
    }
    return false;
  }

  /** Return whether the passed node should have its text flipped upside down */
  flip(d: HierarchyRectangularNode) {
    const myx = this.x((d.x0 + d.x1) / 2);
    return myx > (91 * Math.PI) / 180 && myx < ((360 - 91) * Math.PI) / 180;
  }

  /** Get the length of the hidden arc for the given node */
  pathLength(d: HierarchyRectangularNode) {
    const dx = this.x(d.x1) - this.x(d.x0);
    return (this.y(d.y0) * dx + this.y(d.y1) * dx) / 2;
  }

  /** Check whether the passed textPath is too long for the passed path length */
  isTooLong(textPath: SVGTextPathElement, path: number) {
    if (!textPath) {
      return true;
    }
    return path - this.padding * 2 <= textPath.getComputedTextLength();
  }

  /** Determine whether text is too long for the given arc */
  isTextTooLong(i: number) {
    const d = this.nodeMap[i];
    const text = d.data.name;
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
    const oldText = svgTextPath.text();
    // Try min length
    svgTextPath.text(`${text.substr(0, min)}...`);
    let bIsTooLong = this.isTooLong(textPath, pathLength);
    if (bIsTooLong && text.length) {
      // Test whether full text fits (ellipses take up space too)
      svgTextPath.text(text);
      bIsTooLong = this.isTooLong(textPath, pathLength);
    }
    svgTextPath.text(oldText);
    return bIsTooLong;
  }

  /** Creates a function to set overflow for given index */
  getSetTextOverflowFn(i: number) {
    const d = this.nodeMap[i];
    const text = d.data.name;
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
        if (lower === upper) {
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

  /** Get proper offset (orientation/flip) for node - 25% = up, 75% = down */
  startOffset(d: HierarchyRectangularNode) {
    return this.flip(d) ? '75%' : '25%';
  }

  rebuildChart() {
    if (this.svg) {
      d3.select(`#${this.id}-svg`).remove();
    }
    this.createChart();
  }

  createChart() {
    if (!this.data) {
      return;
    }

    // Declare partition and arcs
    const part = d3.partition<Node>();
    this.arc = d3
      .arc<HierarchyRectangularNode>()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, this.y(d.y0)))
      .outerRadius((d) => Math.max(0, this.y(d.y1)));
    this.textArc = d3
      .arc<HierarchyRectangularNode>()
      .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x0))))
      .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, this.x(d.x1))))
      .innerRadius((d) => Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2))
      .outerRadius((d) => Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2));

    // Create SVG
    this.svg = d3
      .select(this.parentNativeElement)
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
    const root = d3.hierarchy(this.data, (d) => d.children);
    root.sum((d) => (d.children ? 0 : 1));

    // Get sunburst paths
    const sunburst = this.svg
      .selectAll('path')
      .data(part(root).descendants())
      .enter();

    const oldId = this.nodeId;
    this.nodeMap = {};
    this.nodeIdMap = {};
    this.clipMap = {};
    this.nodeId = null;
    let rootId: string;
    let newId: string;
    // Append main arcs with fills
    const arcs = sunburst
      .append('path')
      .attr('d', this.arc)
      .each((d, i) => {
        this.nodeMap[i] = d;
        this.clipMap[i] = 0;
        // Map out IDs, see if old selected ID still exists and reselect it if so.
        const dId = d.data.id;
        this.nodeIdMap[dId] = d;
        if (dId === oldId) {
          newId = dId;
        }
        if (!rootId) {
          rootId = dId;
        }
      })
      .attr('class', (d) => 'arc')
      .attr('cursor', (d) => (d.depth === 0 ? 'default' : 'pointer'))
      .attr('id', (d, i) => `${this.id}-arc${i}`)
      .on('click', (d) => this.click(d));

    // Append hover title
    arcs.append('title').text((d, i) => d.data.name);

    // Append hidden arcs for labels
    sunburst
      .append('path')
      .attr('d', (d) => this.textArc(d))
      .attr('class', (d) => 'hiddenArc')
      .attr('id', (d, i) => `${this.id}-hiddenArc${i}`)
      .style('display', 'none');

    // Append labels
    let offset: number;
    const text = sunburst
      .append('text')
      .attr('class', (d) => 'labelText')
      .attr('id', (d, i) => `${this.id}-labelText${i}`)
      .attr('dy', (d, i) => {
        if (!offset) {
          const labelText = document.getElementById(`${this.id}-labelText${i}`);
          if (labelText) {
            offset =
              parseFloat(window.getComputedStyle(labelText).fontSize) / 3;
          }
        }
        return offset;
      })
      .attr('cursor', (d) => (d.depth === 0 ? 'default' : 'pointer'))
      .style('pointer-events', 'none');
    text
      .append('textPath')
      .attr('id', (d, i) => `${this.id}-labelPath${i}`)
      .attr('class', (d) => 'labelPath')
      .attr('startOffset', (d) => this.startOffset(d))
      .style('text-anchor', 'middle')
      .attr('href', (d, i) => `#${this.id}-hiddenArc${i}`)
      .text((d) => d.data.name);
    text
      .each((d, i) => {
        this.getSetTextOverflowFn(i)();
      })
      .style('visibility', (d, i) => (this.isTextTooLong(i) ? 'hidden' : null));

    if (newId && this.nodeIdMap[newId]) {
      this.click(this.nodeIdMap[newId]);
    } else {
      this.click(this.nodeIdMap[rootId]);
    }
  }

  /** Select the passed node */
  click(d: HierarchyRectangularNode) {
    // Ignore if the passed node is null
    if (!d) {
      return;
    }
    const dId = d.data.id;
    if (dId == null) {
      return;
    }
    if (this.nodeId && this.nodeId === dId) {
      // Ignore if the passed node is the root and is already selected.
      if (d.depth === 0) {
        return;
      }
      // This non-root node is already selected. Select the root node instead.
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
    const xd = d3.interpolate(this.x.domain(), [d.x0, d.x1]);
    const yd = d3.interpolate(this.y.domain(), [d.y0, 1]);
    const yr = d3.interpolate(this.y.range(), [d.y0 ? 20 : 0, this.radius]);

    // Mock up transition to new selected item (1 = after transition)
    this.x.domain(xd(1));
    this.y.domain(yd(1)).range(yr(1));
    d3.selectAll('path.hiddenArc').attr('d', (e: HierarchyRectangularNode) =>
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
    d3.selectAll('path.hiddenArc').attr('d', (e: HierarchyRectangularNode) =>
      this.textArc(e)
    );

    // Set up transition
    const pathTransition = this.svg
      .transition()
      .duration(SunburstComponent.transition)
      .tween('scale', () => {
        return (t) => {
          this.x.domain(xd(t));
          this.y.domain(yd(t)).range(yr(t));
        };
      });

    // Transition arcs
    pathTransition
      .selectAll('path.arc')
      .attrTween('d', (e: HierarchyRectangularNode) => () => this.arc(e));
    pathTransition
      .selectAll('path.hiddenArc')
      .attrTween('d', (e: HierarchyRectangularNode) => () => this.textArc(e));

    // Set up arc pointers (depth 0 should only have pointer when it is not the selected node)
    this.svg
      .selectAll('path.arc')
      .attr('cursor', (e: HierarchyRectangularNode) => {
        return d.depth === 0 && e.depth === 0 ? 'default' : 'pointer';
      });

    // Set up pointers and initial visibility for labels
    this.svg
      .selectAll('text')
      .style('visibility', (e: HierarchyRectangularNode, j) => {
        return this.isParentOf(d, e) && !hideMap[j]
          ? null
          : d3
              .select(document.getElementById(`${this.id}-labelText${j}`))
              .style('visibility');
      })
      .attr('cursor', (e: HierarchyRectangularNode) => {
        return d.depth === 0 && e.depth === 0 ? 'default' : 'pointer';
      })
      // Set up transition for labels
      .transition()
      .duration(SunburstComponent.transition)
      .style('fill-opacity', (e: HierarchyRectangularNode, j) => {
        return this.isParentOf(d, e) && !hideMap[j] ? 1 : 1e-6;
      })
      .on('end', (e: HierarchyRectangularNode, j) => {
        d3.select(document.getElementById(`${this.id}-labelText${j}`)).style(
          'visibility',
          this.isParentOf(d, e) && !hideMap[j] ? null : 'hidden'
        );
      });

    // Set up transition for text offset (text orientation/flip) and clipping
    this.svg
      .selectAll('textPath')
      .transition()
      .duration(SunburstComponent.transition)
      .attrTween('startOffset', (e: HierarchyRectangularNode) => {
        return () => this.startOffset(e);
      })
      .tween('text', (e, j) => {
        return this.getSetTextOverflowFn(j);
      });
  }
}
