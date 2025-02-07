import { Component, ChangeDetectionStrategy, OnInit, Inject } from "@angular/core";
import { NotificationsService } from "src/app/services";
import { TipUpService } from "./tipup";
import { DIALOG_REF, DialogRef } from "../dialog";
import { TIPUP_TOKEN } from "./utils";
import MyYamlFile, { Button, TipUp } from 'js-yaml-loader!../../../i18n/helptexts.yaml';

@Component({
  templateUrl: './tipup.html',
  styleUrls: ['./tipup.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipUpComponent implements OnInit, TipUp {
  title: string = 'N/A';
  content: string = 'N/A';
  nextKey?: string;
  buttons?: Button[];
  url?: string;
  urlText: string = 'Read More';

  constructor(
    @Inject(TIPUP_TOKEN) public readonly token: string,
    @Inject(DIALOG_REF) private readonly dialogRef: DialogRef<TipUpComponent>,
    private notificationService: NotificationsService,
    private tipupService: TipUpService,
  ) { }

  ngOnInit() {
    const doc = this.tipupService.getTipUp(this.token);
    if (!!doc) {
      Object.assign(this, doc);
      this.urlText = doc.urlText || 'Read More';
    }
  }

  async next() {
    if (!this.nextKey) {
      return;
    }

    this.tipupService.open(this.nextKey);
    this.dialogRef.close();
  }

  async runAction(btn: Button) {
    await this.notificationService.performAction(btn.action);

    // if we have a nextKey for the button but do not do in-app
    // routing we should be able to open the next tipup as soon
    // as the action finished
    if (!!btn.nextKey) {
      this.tipupService.waitFor(btn.nextKey!)
        .subscribe({
          next: () => {
            this.dialogRef.close();
            this.tipupService.open(btn.nextKey!);
          },
          error: console.error
        })
    } else {
      this.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
