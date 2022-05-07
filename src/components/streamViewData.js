import {TokenFormatter} from './formatting';
import {STREAM_STATUS} from './lib';

export function streamViewData(stream) {
  const tf = TokenFormatter(stream.token_account_id);

  // public link
  const link = `${window.location.origin}/#/my_streams/${stream.stream_id}`;

  const full = Number(stream.balance) + Number(stream.tokens_total_withdrawn);
  let dateEnd = stream.timestamp_created + tf.secondsToTicks(full/stream.tokens_per_sec);
  dateEnd = new Date(dateEnd/1000000);
  const available_to_withdraw = Math.min(Number(stream.tokens_per_sec)*tf.ticksToS(Date.now()*1000000-stream.last_action), Number(stream.balance));

  const timestampEnd = dateEnd.getTime();

  // progress bar calculations
  const withdrawn = Number(stream.tokens_total_withdrawn);
  const streamed =
    (Number(stream.tokens_total_withdrawn) +
    available_to_withdraw);
  const available = available_to_withdraw;

  const left = full - streamed;
  const progresses = [withdrawn / full, streamed / full];

  const percentages = {
    left: (full - streamed) / full,
    streamed: streamed / full,
    withdrawn: withdrawn / full,
    available: available / full,
  };

  const isDead =
    stream.status === STREAM_STATUS.FINISHED ||
    stream.status === STREAM_STATUS.INTERRUPTED;

  return {
    dateEnd,
    progresses,
    tf,
    isDead,
    percentages,
    link,
    timestampEnd,
    progress: {
      full,
      withdrawn,
      streamed,
      left,
      available,
    },
  };
}
