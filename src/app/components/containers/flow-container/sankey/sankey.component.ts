import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ResizeObserverEntry } from '@juggle/resize-observer';
import {
  SankeyNode,
  SankeyLayout,
  SankeyGraph,
  sankey,
  sankeyLinkHorizontal,
} from 'd3-sankey';
import { sankeyCircular } from 'd3-sankey-circular';
import { select, Selection } from 'd3-selection';
import {
  NgResizeObserver,
  ngResizeObserverProviders,
} from 'ng-resize-observer';

import { SankeyData, Node, Link } from '~/models';

@Component({
  selector: 'lab-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.scss'],
  providers: [...ngResizeObserverProviders],
})
export class SankeyComponent implements OnInit {
  _sankeyData: SankeyData;
  get sankeyData(): SankeyData {
    return this._sankeyData;
  }
  @Input() set sankeyData(value: SankeyData) {
    this._sankeyData = value;
    this.rebuildChart();
  }

  @Output() selectNode = new EventEmitter<string>();

  width = 800;
  height = 400;
  svg: Selection<any, {}, null, undefined>;

  constructor(
    private ref: ElementRef<HTMLElement>,
    public resize$: NgResizeObserver
  ) {}

  ngOnInit(): void {
    this.resize$.subscribe((entry) => this.handleResize(entry));

    this.width = this.ref.nativeElement.getBoundingClientRect().width;
    this.height = Math.min(window.innerHeight * 0.75, this.width / 2);
    if (this.svg) {
      this.rebuildChart();
    }
  }

  handleResize(entry: ResizeObserverEntry): void {
    const w = entry.contentRect.width;
    const h = entry.contentRect.height;
    if (w && h && w / h !== this.width / this.height) {
      this.width = entry.contentRect.width;
      this.height = entry.contentRect.height;
      this.rebuildChart();
    }
  }

  rebuildChart(): void {
    if (this.svg) {
      select('svg').remove();
    }

    if (this.sankeyData.nodes.length && this.sankeyData.links.length) {
      this.createChart();
    }
  }

  getLayout(
    fn: () => SankeyLayout<SankeyGraph<Node, Link>, Node, Link>
  ): SankeyGraph<Node, Link> {
    const skLayout = fn()
      .nodeId((d) => d.id)
      .nodeWidth(32)
      .nodePadding(10)
      .extent([
        [1, 5],
        [this.width - 1, this.height - 5],
      ]);

    return skLayout({
      nodes: this.sankeyData.nodes.map((d) => ({ ...d })),
      links: this.sankeyData.links.map((l) => ({ ...l })),
    });
  }

  createChart(): void {
    this.svg = select(this.ref.nativeElement)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    let skGraph = this.getLayout(sankeyCircular);
    let circular = true;

    if (!skGraph.nodes.some((n: any) => n.partOfCycle === true)) {
      // No circular references, use built in sankey generator
      skGraph = this.getLayout(sankey);
      circular = false;
    }

    // Draw linkages (draw first so rects are drawn over them)
    const link = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .style('will-change', 'opacity')
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr(
        'd',
        circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
      )
      .attr('stroke', (l) => l.color)
      .attr('stroke-width', (l) => Math.max(1, l.width));

    link.append('title').text((l) => l.name);

    // Draw rects for nodes
    this.svg
      .append('g')
      .attr('stroke', '#000')
      .selectAll('rect')
      .data(skGraph.nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('fill', (d) => d.color)
      .on('click', (e, d) => {
        // Typings currently incorrect: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
        const node = (d as any) as SankeyNode<Node, Link>;
        this.selectNode.emit(node.id);
      })
      .append('title')
      .text((d) => d.name);

    // Draw icons (for rect height >= 16px)
    this.svg
      .append('g')
      .selectAll('svg')
      .data(skGraph.nodes.filter((d) => d.y1 - d.y0 >= 16))
      .join('svg')
      .attr('viewBox', (d) => d.viewBox)
      .attr('width', (d) => Math.min(30, d.y1 - d.y0 - 2))
      .attr('height', (d) => Math.min(30, d.y1 - d.y0 - 2))
      .attr('x', (d) => (d.x1 + d.x0) / 2 - Math.min(30, d.y1 - d.y0 - 2) / 2)
      .attr('y', (d) => (d.y1 + d.y0) / 2 - Math.min(30, d.y1 - d.y0 - 2) / 2)
      .style('pointer-events', 'none')
      .append('image')
      .attr('href', (d) => d.href);

    // Draw text (for rect height < 16px)
    this.svg
      .append('g')
      .selectAll('text')
      .data(skGraph.nodes.filter((d) => d.y1 - d.y0 < 16))
      .join('text')
      .attr('x', (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 < this.width / 2 ? 'start' : 'end'))
      .text((d) => d.name)
      .style('pointer-events', 'none');
  }
}
