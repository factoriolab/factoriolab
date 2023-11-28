import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { drag } from 'd3-drag';
import { select, Selection } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { FlowData, Link, Node } from '~/models';
import { DisplayService, FlowService } from '~/services';
import {
  sankey,
  SankeyGraph,
  sankeyJustify,
  SankeyLayout,
  SankeyLinkExtraProperties,
  sankeyLinkHorizontal,
  sankeyLinkLoop,
  SankeyNode,
} from './d3-sankey';

const SVG_ID = 'lab-flow-svg';
const NODE_WIDTH = 32;

@UntilDestroy()
@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent implements AfterViewInit {
  ref = inject(ChangeDetectorRef);
  displaySvc = inject(DisplayService);
  flowSvc = inject(FlowService);

  @ViewChild('svg') svgElement: ElementRef | undefined;

  selectedId: string | undefined;
  height = window.innerHeight * 0.75;
  svg: Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  skLayout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> | undefined;

  loading$ = new BehaviorSubject(true);
  vm$ = combineLatest([this.loading$]).pipe(map(([loading]) => ({ loading })));

  ngAfterViewInit(): void {
    this.flowSvc.flowData$
      .pipe(untilDestroyed(this))
      .subscribe((flowData) => this.rebuildChart(flowData));
  }

  rebuildChart(flowData: FlowData): void {
    if (this.svg) {
      select(`#${SVG_ID}`).remove();
    }

    if (!flowData.nodes.length || !flowData.links.length) return;

    if (this.svgElement) {
      let skGraph = this.getLayout(flowData, 800, this.height);
      const columns = Math.max(
        ...skGraph.nodes.map((d) => this.orZero(d.depth)),
      );
      const width = (columns + 1) * NODE_WIDTH + columns * NODE_WIDTH * 12;
      const height = Math.min(this.height, width * 0.75);
      skGraph = this.getLayout(flowData, width, height);

      this.svg = select(this.svgElement.nativeElement)
        .append('svg')
        .attr('id', SVG_ID)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('width', `${width}px`)
        .attr('height', `${height}px`)
        .style('width', `${width}px`)
        .style('height', `${height}px`)
        .attr('viewBox', `0 0 ${width} ${height}`);

      this.svg.call(
        zoom<SVGSVGElement, unknown>().on('zoom', (e): void => {
          this.svg!.selectAll('svg > g').attr('transform', e.transform);
        }),
      );

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
        .attr('d', (l) =>
          (l as SankeyLinkExtraProperties).direction === 'forward'
            ? sankeyLinkHorizontal()(l)
            : sankeyLinkLoop(
                l.width ?? 0,
                NODE_WIDTH,
                (l.source as SankeyNode<Node, Link>).y1!,
                (l.target as SankeyNode<Node, Link>).y1!,
              )(l),
        )
        .attr('stroke', (l) => l.color)
        .attr('stroke-width', (l) => Math.max(1, this.orZero(l.width)));

      link.append('title').text((l) => l.name);

      this.svg
        .append('g')
        .selectAll('text')
        .data(skGraph.links)
        .join('text')
        .append('textPath')
        .attr('startOffset', '4px')
        .attr('href', (l) => `#${l.index}`)
        .text((l) => `${l.text} ${l.name}`);

      // For use inside drag function
      const layout = this.skLayout;
      const orZero = this.orZero;

      // Draw rects for nodes
      this.svg
        .append('g')
        .attr('stroke', 'var(--surface-ground)')
        .selectAll<SVGRectElement, SankeyNode<Node, Link>>('rect')
        .data(skGraph.nodes)
        .join('rect')
        .attr('x', (d) => this.orZero(d.x0))
        .attr('y', (d) => this.orZero(d.y0))
        .attr('height', (d) => this.rngY(d))
        .attr('width', (d) => this.orZero(d.x1) - this.orZero(d.x0))
        .attr('fill', (d) => d.color)
        .on('click', (e, d) => {
          if (e.defaultPrevented) return;
          this.setSelected(d.stepId);
        })
        .call(
          drag<SVGRectElement, SankeyNode<Node, Link>>()
            .subject((d) => d)
            .on('drag', function (this, event, d) {
              const rectY = parseFloat(select(this).attr('y'));
              const rectX = parseFloat(select(this).attr('x'));
              d.y0 = orZero(d.y0) + event.dy;
              d.x0 = orZero(d.x0) + event.dx;
              d.x1 = orZero(d.x1) + event.dx;
              const trX = orZero(d.x0) - rectX;
              const trY = orZero(d.y0) - rectY;
              const transform = 'translate(' + trX + ',' + trY + ')';
              select(this).attr('transform', transform);
              d.trY = trY;

              // also move the image
              select(`[id='image-${d.id}']`).attr('transform', transform);
              if (layout) {
                layout.update(skGraph);
              }

              // force an update of the path
              path.attr('d', (l) => {
                if ((l as SankeyLinkExtraProperties).direction === 'forward')
                  return sankeyLinkHorizontal()(l);

                const source = l.source as SankeyNode<Node, Link>;
                const target = l.target as SankeyNode<Node, Link>;

                return sankeyLinkLoop(
                  l.width ?? 0,
                  NODE_WIDTH,
                  source.y1! + orZero(source.trY),
                  target.y1! + orZero(target.trY),
                )(l);
              });
            }),
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
        .attr(
          'x',
          (d) =>
            (this.orZero(d.x1) + this.orZero(d.x0)) / 2 -
            Math.min(30, this.rngY(d) - 2) / 2,
        )
        .attr(
          'y',
          (d) =>
            (this.orZero(d.y1) + this.orZero(d.y0)) / 2 -
            Math.min(30, this.rngY(d) - 2) / 2,
        )
        .style('pointer-events', 'none')
        .append('image')
        .attr('href', (d) => d.href ?? '');
    }
  }

  getLayout(
    data: FlowData,
    width: number,
    height: number,
  ): SankeyGraph<Node, Link> {
    const fn: () => SankeyLayout<SankeyGraph<Node, Link>, Node, Link> = sankey;
    this.skLayout = fn()
      .nodeId((d) => d.id)
      .nodeWidth(NODE_WIDTH)
      .nodePadding(8)
      .nodeAlign(sankeyJustify)
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    return this.skLayout({
      nodes: data.nodes
        .filter((n) =>
          data.links.some((l) => l.source === n.id || l.target === n.id),
        )
        .map((d) => ({ ...d })),
      links: data.links.map((l) => ({ ...l })),
    });
  }

  orZero(n?: number): number {
    return n ?? 0;
  }

  rngY(d: SankeyNode<Node, Link>): number {
    return this.orZero(d.y1) - this.orZero(d.y0);
  }

  setSelected(id: string): void {
    this.selectedId = id;
    this.ref.detectChanges();
  }
}
