import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { Comment } from '../comment.model';
import { PostsService } from '../post.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  constructor(
    public postsService: PostsService,
    private authService: AuthService,
    private router: Router
  ) {}
  isLoading = false;
  isLoggedIn = this.authService.isLoggedIn();
  username = this.authService.getUsername();
  posts: Post[] = [];
  private postsSub: Subscription;
  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        for (let i = 0; i < posts.length; i++) {
          if (posts[i].comments) {
            posts[i].comments.isCollapsed = true;
          }
        }
        this.posts = posts.reverse();
        this.isLoading = false;
      });
  }
  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  onLike(postId, userId) {
    this.postsService.onLike(postId, userId, this.callbackF, this);
  }

  myFunc(newComment: HTMLInputElement, postId) {
    if (newComment.value == '') return;
    this.postsService.addComment(
      newComment.value,
      postId,
      this.callbackF2,
      this
    );
    newComment.value = '';
  }

  callbackF2(json: any, ovo) {
    console.log('hehehe ' + json.postId);
    for (let i = 0; i < ovo.posts.length; i++) {
      if (ovo.posts[i].id === json.postId) {
        let com: Comment = {
          id: json.postId,
          username: json.username,
          text: json.text,
        };
        ovo.posts[i].comments.push(com);
      }
    }
  }

  callbackF(responseData: any, ovo) {
    for (let i = 0; i < ovo.posts.length; i++) {
      if (ovo.posts[i].id === responseData.postId) {
        if (ovo.posts[i].likesCount < responseData.newLikeCount) {
          ovo.posts[i].liked.push('5');
        } else {
          const index = ovo.posts[i].liked.indexOf('5');
          if (index > -1) {
            ovo.posts[i].liked.splice(index, 1);
          }
        }
        ovo.posts[i].likesCount = responseData.newLikeCount;
      }
    }
    console.log(ovo.posts);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
