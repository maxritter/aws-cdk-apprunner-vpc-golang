import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AppRunnerStack } from '../src/app-runner-stack';

test('Snapshot', () => {
  const app = new App();
  const stack = new AppRunnerStack(app, 'test');

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});