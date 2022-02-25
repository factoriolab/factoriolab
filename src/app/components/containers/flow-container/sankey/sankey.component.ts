import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import {
  SankeyNode,
  SankeyGraph,
  sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
  sankeyCenter,
  sankeyLeft,
  sankeyRight,
  SankeyNodeMinimal,
  SankeyLayout,
} from 'd3-sankey';
import { sankeyCircular } from 'd3-sankey-circular';
import { select, Selection } from 'd3-selection';
import { drag } from 'd3-drag';

import { Node, Link, SankeyAlign } from '~/models';

@Component({
  selector: 'lab-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.scss'],
})
export class SankeyComponent implements OnChanges {
  @Input() nodes: Node[] = [];
  @Input() links: Link[] = [];
  @Input() align = SankeyAlign.Justify;

  @Output() selectNode = new EventEmitter<string>();

  height = window.innerHeight * 0.75;
  svg: Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  skLayout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> | undefined;

  get linkedNodes(): Node[] {
    return this.nodes.filter((n) =>
      this.links.some((l) => l.source === n.id || l.target === n.id)
    );
  }

  constructor(private ref: ElementRef<HTMLElement>) {}

  ngOnChanges(): void {
    this.rebuildChart();
  }

  rebuildChart(): void {
    if (this.svg) {
      select('svg').remove();
    }

    if (this.nodes.length && this.links.length) {
      this.createChart();
    }
  }

  getLayout(
    circular: boolean,
    width: number,
    height: number
  ): SankeyGraph<Node, Link> {
    const fn: () => SankeyLayout<SankeyGraph<Node, Link>, Node, Link> = circular
      ? sankeyCircular
      : sankey;
    this.skLayout = fn()
      .nodeId((d) => d.id)
      .nodeWidth(32)
      .nodePadding(8)
      .nodeAlign(this.getAlign(this.align))
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    return this.skLayout({
      nodes: this.linkedNodes.map((d) => ({ ...d })),
      links: this.links.map((l) => ({ ...l })) ?? [],
    });
  }

  getAlign(
    align: SankeyAlign | undefined
  ): (node: SankeyNodeMinimal<{}, {}>, n: number) => number {
    switch (align) {
      case SankeyAlign.Left:
        return sankeyLeft;
      case SankeyAlign.Right:
        return sankeyRight;
      case SankeyAlign.Center:
        return sankeyCenter;
      default:
        return sankeyJustify;
    }
  }

  createChart(): void {
    let circular = true;
    let skGraph = this.getLayout(true, 800, this.height);

    if (!skGraph.nodes.some((n: any) => n.partOfCycle === true)) {
      // No circular references, use built in sankey generator
      circular = false;
      skGraph = this.getLayout(circular, 800, this.height);
    }

    const columns = Math.max(...skGraph.nodes.map((n) => n.depth ?? 0));
    const width = (columns + 1) * 32 + columns * 32 * 12;
    const height = Math.min(this.height, width * 0.75);
    skGraph = this.getLayout(circular, width, height);

    this.svg = select(this.ref.nativeElement)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('width', `${width}px`)
      .attr('height', `${height}px`)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Draw linkages (draw first so rects are drawn over them)
    const link = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.6)
      .style('will-change', 'opacity')
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    const path = link
      .append('path')
      .attr('id', (l) => `${l.index}`)
      .attr(
        'd',
        circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
      )
      .attr('stroke', (l) => l.color)
      .attr('stroke-width', (l) => Math.max(1, l.width ?? 0));

    link.append('title').text((l) => l.name);

    const layout = this.skLayout;
    function dragMove(
      this: SVGElement,
      event: any,
      d: SankeyNode<Node, Link>
    ): void {
      const rectY = parseFloat(select(this).attr('y'));
      const rectX = parseFloat(select(this).attr('x'));
      d.y0 = d.y0 + event.dy;
      d.x0 = d.x0 + event.dx;
      d.x1 = d.x1 + event.dx;
      const trX = d.x0 ?? 0 - rectX;
      const trY = d.y0 ?? 0 - rectY;
      const transform = 'translate(' + trX + ',' + trY + ')';
      select(this).attr('transform', transform);

      // also move the image
      select(`[id='image-${d.id}']`).attr('transform', transform);
      if (layout) {
        layout.update(skGraph);
      }

      // force an update of the path
      path.attr(
        'd',
        circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
      );
    }

    this.svg
      .append('g')
      .selectAll('text')
      .data(skGraph.links)
      .join('text')
      .append('textPath')
      .attr('startOffset', '4px')
      .attr('href', (l) => `#${l.index}`)
      .text((l) => `${l.text} ${l.name}`);

    // Draw rects for nodes
    const a = this.svg
      .append('g')
      .attr('stroke', 'var(--color-black)')
      .selectAll<SVGRectElement, SankeyNode<Node, Link>>('rect')
      .data(skGraph.nodes)
      .join('rect')
      .attr('x', (d) => d.x0 ?? 0)
      .attr('y', (d) => d.y0 ?? 0)
      .attr('height', (d) => this.rngY(d))
      .attr('width', (d) => this.rngX(d))
      .attr('fill', (d) => d.color)
      .on('click', (e, d) => {
        if (e.defaultPrevented) return;
        this.selectNode.emit(d.id);
      })
      .call(
        drag<SVGRectElement, SankeyNode<Node, Link>>()
          .subject((d) => d)
          .on('drag', dragMove)
      )
      .append('title')
      .text((d) => d.name);

    // Draw icons (for rect height >= 16px)
    this.svg
      .append('g')
      .selectAll('svg')
      .data(skGraph.nodes.filter((d) => this.rngY(d) >= 16))
      .join('g')
      .attr('id', (d) => `image-${d.id}`)
      .append('svg')
      .attr('viewBox', (d) => d.viewBox)
      .attr('width', (d) => Math.min(30, this.rngY(d) - 2))
      .attr('height', (d) => Math.min(30, this.rngY(d) - 2))
      .attr('x', (d) => this.midX(d) - Math.min(30, this.rngY(d) - 2) / 2)
      .attr('y', (d) => this.midY(d) - Math.min(30, this.rngY(d) - 2) / 2)
      .style('pointer-events', 'none')
      .append('image')
      .attr('href', (d) => d.href);
  }

  rngY(d: SankeyNode<Node, Link>): number {
    return (d.y1 ?? 0) - (d.y0 ?? 0);
  }

  rngX(d: SankeyNode<Node, Link>): number {
    return (d.x1 ?? 0) - (d.x0 ?? 0);
  }

  midX(d: SankeyNode<Node, Link>): number {
    return ((d.x1 ?? 0) + (d.x0 ?? 0)) / 2;
  }

  midY(d: SankeyNode<Node, Link>): number {
    return ((d.y1 ?? 0) + (d.y0 ?? 0)) / 2;
  }
}
