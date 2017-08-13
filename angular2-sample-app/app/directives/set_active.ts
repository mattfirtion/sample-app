import {
  Directive,
  ElementRef,
  Inject,
  Renderer,
  QueryList,
  Query
} from 'angular2/core';
import {Location} from 'angular2/router';
import 'rxjs/add/operator/map';

/**
 * Simple directive to add class active on a LI element when
 * its A child element is clicked or on page load. Active class
 * is removed from all other LI element.
 * Follow the same principle as nav's in Bootstrap.
 *
 * @Example:
 * 	<ul set-active>
 * 		<li>
 * 			<a href="a1">link 1</a>
 * 		</li>
 * 		<li>
 * 			<a href="a">link 2</a>
 * 		</li>
 * 	</ul>
 */
@Directive({ selector: 'a' })
class Link {
  constructor (private el: ElementRef) {}
  get href(): string {
    // Rely on the DOM until there is a better option.
    // The problem is that the href attribute is generated by router-link
    // directive which is instantiated after this one. href is then not
    // available at that time.
    return this.el.nativeElement.getAttribute('href');
  }
}

@Directive({ selector: 'li' })
class ListItem {
  className = 'active';
  constructor(@Query(Link) public links: QueryList<Link>,
              @Inject(Location) public location: Location,
              private el: ElementRef,
              private renderer: Renderer) {}
  toggleClass() {
    if (this.linkHref === `#${this.location.path()}`) {
      this.renderer.setElementClass(this.el, this.className, true);
    } else {
      this.renderer.setElementClass(this.el, this.className, false);
    }
  }
  get linkHref(): string {
    return this.links.first.href;
  }
}

@Directive({ selector: '[set-active]', host: { '(click)': 'setActive()' } })
class List {
  _href;
  constructor(@Query(ListItem) private items: QueryList<ListItem>) {
    // _items is populated later on as it's refers to child classes.
    // So we wait for changes.
    // TODO: Figure out the changes needed here to make this work again
    this.items.changes.subscribe(_ => {
      this.setActive();
    });
  }
  setActive(): void {
    this.items.map(item => {
      item.toggleClass();
    });
  }
}

export var SetActive = [List, ListItem, Link];
