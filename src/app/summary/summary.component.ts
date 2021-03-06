import { Component, OnInit } from '@angular/core';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { ActivatedRoute, Params } from '@angular/router';
import { AppDataService } from 'app/services/app-data.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [PiaService]
})
export class SummaryComponent implements OnInit {

  content: any[];
  pia: any;
  allData: any[];
  dataNav: any;
  showPiaTpl: boolean;

  constructor(private route: ActivatedRoute,
              private _attachmentsService: AttachmentsService,
              private _actionPlanService: ActionPlanService,
              private _translateService: TranslateService,
              private _appDataService: AppDataService,
              private _piaService: PiaService) { }

  async ngOnInit() {
    this.content = [];
    this.dataNav = await this._appDataService.getDataNav();
    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      if (this.route.snapshot.params['type'] === 'pia') {
        this.showPiaTpl = true;
        this.showPia();
      } else if (this.route.snapshot.params['type'] === 'action_plan') {
        this.showPiaTpl = false;
        this.showActionPlan();
      }
    });
  }

  /**
   * Prepare and display the PIA information
   * @memberof SummaryComponent
   */
  showPia() {
    this.prepareHeader();

    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;

    this._attachmentsService.pia = this.pia;
    this._attachmentsService.listAttachments().then(() => {
      const attachmentElement = { title: 'summary.attachments', subtitle: null, data: [] };
      this._attachmentsService.attachments.forEach((attachment) => {
        attachmentElement.data.push({ content: attachment.name });
      });
      this.content.push(attachmentElement);
    });

    this.getJsonInfo().then(() => {
      for (const index in this.allData) {
        if (this.allData.hasOwnProperty(index)) {
          const element = this.allData[index];
          const el = { title: element.sectionTitle,
                       subtitle: element.itemTitle,
                       data: [],
                       evaluation: element.evaluation ? element.evaluation : null };
          if (element.questions.length > 0) {
            element.questions.forEach(question => {
              el.data.push({
                title: question.title,
                content: question.content,
                evaluation: question.evaluation ? question.evaluation : null
              });
            });
          }
          this.content.push(el);
        }
      }
    });
    this._actionPlanService.listActionPlan(this._translateService);
  }

  /**
   * Prepare and display the ActionPlan information
   * @memberof SummaryComponent
   */
  showActionPlan() {
    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;
    this._actionPlanService.listActionPlan(this._translateService);
  }

  /**
   * Get PIA information
   * @private
   * @memberof SummaryComponent
   */
  private prepareHeader() {
    const el = { title: 'summary.title', data: [] };

    if (this.pia.name && this.pia.name.length > 0) {
      el.data.push({
        title: 'summary.pia_name',
        content: this.pia.name
      });
    }
    if (this.pia.author_name && this.pia.author_name.length > 0) {
      el.data.push({
        title: 'summary.pia_author',
        content: this.pia.author_name
      });
    }
    if (this.pia.evaluator_name && this.pia.evaluator_name.length > 0) {
      el.data.push({
        title: 'summary.pia_assessor',
        content: this.pia.evaluator_name
      });
    }
    if (this.pia.validator_name && this.pia.validator_name.length > 0) {
      el.data.push({
        title: 'summary.pia_validator',
        content: this.pia.validator_name
      });
    }
    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      el.data.push({
        title: 'summary.dpo_name',
        content: this.pia.dpos_names
      });
    }
    if ( this.pia.dpo_status >= 0) {
      el.data.push({
        title: 'summary.dpo_status',
        content: this.pia.getOpinionsStatus(this.pia.dpo_status.toString())
      });
    }
    if (this.pia.dpo_opinion && this.pia.dpo_opinion.length > 0) {
      el.data.push({
        title: 'summary.dpo_opinion',
        content: this.pia.dpo_opinion
      });
    }

    // Searched opinion for concerned people
    if (this.pia.concerned_people_searched_opinion === true) {
      el.data.push({
        title: 'summary.concerned_people_searched_opinion',
        content: this.pia.getPeopleSearchStatus(this.pia.concerned_people_searched_opinion)
      });
      if (this.pia.people_names && this.pia.people_names.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_name',
          content: this.pia.people_names
        });
      }
      if (this.pia.concerned_people_status >= 0) {
        el.data.push({
          title: 'summary.concerned_people_status',
          content: this.pia.getOpinionsStatus(this.pia.concerned_people_status.toString())
        });
      }
      if (this.pia.concerned_people_opinion && this.pia.concerned_people_opinion.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_opinion',
          content: this.pia.concerned_people_opinion
        });
      }
    }

    // Unsearched opinion for concerned people
    if (this.pia.concerned_people_searched_opinion === false) {
      el.data.push({
        title: 'summary.concerned_people_searched_opinion',
        content: this.pia.getPeopleSearchStatus(this.pia.concerned_people_searched_opinion)
      });
      if (this.pia.concerned_people_searched_content && this.pia.concerned_people_searched_content.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_unsearched_opinion_comment',
          content: this.pia.concerned_people_searched_content
        });
      }
    }

    if (this.pia.applied_adjustements && this.pia.applied_adjustements.length > 0) {
      el.data.push({
        title: 'summary.modification_made',
        content: this.pia.applied_adjustements
      });
    }
    if (this.pia.rejected_reason && this.pia.rejected_reason.length > 0) {
      el.data.push({
        title: 'summary.rejection_reason',
        content: this.pia.rejected_reason
      });
    }
    if (this.pia.created_at) {
      el.data.push({
        title: 'summary.creation_date',
        type: 'date',
        content: this.pia.created_at
      });
    }
    this.content.push(el);
  }

  /**
   * Get information from the JSON file
   * @returns {Promise}
   * @private
   * @memberof SummaryComponent
   */
  private async getJsonInfo() {
    this.allData = [];
    return new Promise((resolve, reject) => {
      if (this._piaService.data) {
        this._piaService.data.sections.forEach(async (section) => {
          section.items.forEach(async (item) => {
            const ref = section.id.toString() + '.' + item.id.toString();
            let evaluation = null;
            if (item.evaluation_mode === 'item') {
              const evaluationModel = new Evaluation();
              const exist = await evaluationModel.getByReference(this.pia.id, ref);
              if (exist) {
                evaluation = {
                  'title': evaluationModel.getStatusName(),
                  'action_plan_comment': evaluationModel.action_plan_comment,
                  'evaluation_comment': evaluationModel.evaluation_comment,
                  'gauges': {
                    'riskName': { value: this._translateService.instant('sections.3.items.' + item.id + '.title') },
                    'seriousness': evaluationModel.gauges ? evaluationModel.gauges.x : null,
                    'likelihood': evaluationModel.gauges ? evaluationModel.gauges.y : null
                  }
                };
              }
            }
            this.allData[ref] = {
              sectionTitle: section.title,
              itemTitle: item.title,
              evaluation: evaluation,
              questions: []
            }
            if (item.is_measure) {
              const measuresModel = new Measure();
              measuresModel.pia_id = this.pia.id;
              const entries: any = await measuresModel.findAll();
              entries.forEach(async (measure) => {
                if (measure.title !== undefined && measure.content !== undefined) {
                  evaluation = null;
                  if (item.evaluation_mode === 'question') {
                    const evaluationModel = new Evaluation();
                    const exist = await evaluationModel.getByReference(this.pia.id, ref + '.' + measure.id);
                    if (exist) {
                      evaluation = {
                        'title': evaluationModel.getStatusName(),
                        'action_plan_comment': evaluationModel.action_plan_comment,
                        'evaluation_comment': evaluationModel.evaluation_comment,
                        'gauges': {
                          'riskName': { value: this._translateService.instant('sections.3.items.' + item.id + '.title') },
                          'seriousness': evaluationModel.gauges ? evaluationModel.gauges.x : null,
                          'likelihood': evaluationModel.gauges ? evaluationModel.gauges.y : null
                        }
                      };
                    }
                  }
                  this.allData[ref]['questions'].push({
                    title: measure.title,
                    content: measure.content,
                    evaluation: evaluation
                  });
                }
              });
            } else if (item.questions) {
              item.questions.forEach(async (question) => {
                const answerModel = new Answer();
                await answerModel.getByReferenceAndPia(this.pia.id, question.id);
                if (answerModel.data) {
                  const content = [];
                  if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                    content.push(this._translateService.instant(this.pia.getGaugeName(answerModel.data.gauge)));
                  }
                  if (answerModel.data.text && answerModel.data.text.length > 0) {
                    content.push(answerModel.data.text);
                  }
                  if (answerModel.data.list && answerModel.data.list.length > 0) {
                    content.push(answerModel.data.list.join(', '));
                  }
                  if (content.length > 0) {
                    evaluation = null;
                    if (item.evaluation_mode === 'question') {
                      const evaluationModel = new Evaluation();
                      const exist = await evaluationModel.getByReference(this.pia.id, ref + '.' + question.id);
                      if (exist) {
                        evaluation = {
                          'title': evaluationModel.getStatusName(),
                          'action_plan_comment': evaluationModel.action_plan_comment,
                          'evaluation_comment': evaluationModel.evaluation_comment,
                          'gauges': {
                            'riskName': { value: this._translateService.instant('sections.3.items.' + item.id + '.title') },
                            'seriousness': evaluationModel.gauges ? evaluationModel.gauges.x : null,
                            'likelihood': evaluationModel.gauges ? evaluationModel.gauges.y : null
                          }
                        };
                      }
                    }
                    this.allData[ref]['questions'].push({
                      title: question.title,
                      content: content.join(', '),
                      evaluation: evaluation
                    });
                  }
                }
                if (section.id === 3 && item.id === 4) {
                  resolve();
                }
              });
            }
          });
        });
      }
    });
  }
}
