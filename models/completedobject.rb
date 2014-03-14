require 'mongoid'

class Completedobject
  include Mongoid::Document

  belongs_to :quest
  belongs_to :level
  belongs_to :task
  belongs_to :checklistitem

  field :text, :type => String
  field :user_id, :type => String
  field :group_id, :type => String
  field :finished_on, :type => Integer, :default => 0
end