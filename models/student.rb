require 'mongoid'

class Student
  include Mongoid::Document

  belongs_to :group

  field :facebook_id, :type => String
  field :expert_level, :type => Integer, :default => 0
end